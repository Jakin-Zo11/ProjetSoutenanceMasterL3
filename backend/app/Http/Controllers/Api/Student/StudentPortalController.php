<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Admin\PvSoutenanceController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Student\StoreStudentDepositRequest;
use App\Models\Depot;
use App\Models\Evaluation;
use App\Models\StudentNotification;
use App\Models\Soutenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentPortalController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $student = $request->user();
        $theme = $this->latestDeposit($student->id, 'theme');
        $thesis = $this->latestDeposit($student->id, 'memoire');
        $defense = $this->studentDefense($student->id);
        $result = $defense ? $this->publishedEvaluations($defense) : collect();

        return response()->json([
            'success' => true,
            'data' => [
                'themeApproved' => $theme?->status === 'valide',
                'thesisApproved' => $thesis?->status === 'valide',
                'defenseScheduled' => $defense !== null && $defense->status !== 'annulee',
                'resultPublished' => $defense?->status === 'terminee' && $result->isNotEmpty(),
                'pvAvailable' => $defense?->status === 'terminee' && $result->isNotEmpty(),
            ],
        ]);
    }

    public function showTheme(Request $request): JsonResponse
    {
        return $this->showDeposit($request, 'theme');
    }

    public function storeTheme(StoreStudentDepositRequest $request): JsonResponse
    {
        return $this->storeDeposit($request, 'theme');
    }

    public function showThesis(Request $request): JsonResponse
    {
        return $this->showDeposit($request, 'memoire');
    }

    public function storeThesis(StoreStudentDepositRequest $request): JsonResponse
    {
        return $this->storeDeposit($request, 'memoire');
    }

    public function defense(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatDefense($this->studentDefense($request->user()->id)),
        ]);
    }

    public function convocation(Request $request): JsonResponse
    {
        $defense = $this->studentDefense($request->user()->id);
        if ($defense?->status === 'annulee') {
            $defense = null;
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatDefense($defense),
        ]);
    }

    public function result(Request $request): JsonResponse
    {
        $defense = $this->studentDefense($request->user()->id);
        $evaluations = $defense?->status === 'terminee'
            ? $this->publishedEvaluations($defense)
            : collect();

        if ($evaluations->isEmpty()) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $average = round((float) $evaluations->avg('note_finale'), 2);

        return response()->json([
            'success' => true,
            'data' => [
                'average' => $average,
                'mention' => $this->mentionFor($average),
                'publishedAt' => $defense->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function pv(Request $request): JsonResponse
    {
        $defense = $this->studentDefense($request->user()->id);
        if (! $defense || $defense->status !== 'terminee' || $this->publishedEvaluations($defense)->isEmpty()) {
            return response()->json(['success' => true, 'data' => null]);
        }

        $response = app(PvSoutenanceController::class)->getPv($defense->id);

        return $response;
    }

    public function downloadDeposit(Request $request, Depot $depot)
    {
        abort_unless((int) $depot->etudiant_id === (int) $request->user()->id, 404);
        abort_unless(Storage::disk('local')->exists($depot->file_path), 404);

        return Storage::disk('local')->download($depot->file_path, basename($depot->file_path));
    }

    public function notifications(Request $request): JsonResponse
    {
        $student = $request->user();
        $events = $this->currentStudentEvents($student->id);

        foreach ($events as $event) {
            StudentNotification::firstOrCreate(
                ['user_id' => $student->id, 'event_key' => $event['event_key']],
                $event,
            );
        }

        $notifications = StudentNotification::where('user_id', $student->id)
            ->orderByDesc('occurred_at')
            ->get()
            ->map(fn (StudentNotification $notification) => [
                'id' => (string) $notification->id,
                'type' => $notification->type,
                'titre' => $notification->title,
                'description' => $notification->message,
                'date' => $notification->occurred_at->toIso8601String(),
                'lue' => $notification->read_at !== null,
            ]);

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function markNotificationRead(Request $request, StudentNotification $notification): JsonResponse
    {
        abort_unless((int) $notification->user_id === (int) $request->user()->id, 404);
        $notification->forceFill(['read_at' => now()])->save();

        return response()->json(['success' => true]);
    }

    private function showDeposit(Request $request, string $type): JsonResponse
    {
        $deposit = $this->latestDeposit($request->user()->id, $type);

        return response()->json([
            'success' => true,
            'data' => $deposit ? $this->formatDeposit($deposit) : null,
        ]);
    }

    private function storeDeposit(StoreStudentDepositRequest $request, string $type): JsonResponse
    {
        $student = $request->user();
        if (! $student->promotion_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune promotion n’est associée à votre compte. Contactez la scolarité.',
            ], 422);
        }

        $latest = $this->latestDeposit($student->id, $type);
        if ($latest && $latest->status !== 'rejete') {
            return response()->json([
                'success' => false,
                'message' => 'Un dépôt est déjà en cours ou validé.',
            ], 409);
        }

        $file = $request->file('file');
        $path = $file->storeAs(
            "student-deposits/{$student->id}/{$type}",
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            'local',
        );

        if (! $path) {
            return response()->json(['success' => false, 'message' => 'Le fichier n’a pas pu être enregistré.'], 500);
        }

        $deposit = Depot::create([
            'etudiant_id' => $student->id,
            'promotion_id' => $student->promotion_id,
            'type' => $type,
            'title' => $request->validated('title'),
            'file_path' => $path,
            'status' => 'en_attente',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dépôt enregistré et transmis à la scolarité.',
            'data' => $this->formatDeposit($deposit),
        ], 201);
    }

    private function latestDeposit(int $studentId, string $type): ?Depot
    {
        return Depot::where('etudiant_id', $studentId)
            ->where('type', $type)
            ->latest('id')
            ->first();
    }

    private function formatDeposit(Depot $deposit): array
    {
        return [
            'id' => $deposit->id,
            'type' => $deposit->type,
            'title' => $deposit->title,
            'fileName' => basename($deposit->file_path),
            'fileUrl' => route('student.deposits.file', ['depot' => $deposit->id]),
            'status' => $deposit->status,
            'comment' => $deposit->remarque,
            'submittedAt' => $deposit->submitted_at?->toIso8601String(),
            'validatedAt' => $deposit->validated_at?->toIso8601String(),
        ];
    }

    private function studentDefense(int $studentId): ?Soutenance
    {
        return Soutenance::with(['depot', 'room', 'sessionSoutenance', 'evaluations'])
            ->whereHas('depot', fn ($query) => $query
                ->where('etudiant_id', $studentId)
                ->where('type', 'memoire'))
            ->latest('date')
            ->first();
    }

    private function formatDefense(?Soutenance $defense): ?array
    {
        if (! $defense) {
            return null;
        }

        return [
            'id' => $defense->id,
            'title' => $defense->depot?->title,
            'status' => $defense->status,
            'date' => $defense->date?->toIso8601String(),
            'time' => $defense->date?->format('H:i'),
            'room' => $defense->room ? [
                'name' => $defense->room->name,
                'building' => $defense->room->building,
            ] : null,
            'session' => $defense->sessionSoutenance?->title,
            'jury' => null,
            'convocationDocument' => null,
        ];
    }

    private function publishedEvaluations(Soutenance $defense)
    {
        return $defense->evaluations
            ->where('status', 'valide')
            ->filter(fn (Evaluation $evaluation) => $evaluation->note_finale !== null);
    }

    private function mentionFor(float $average): string
    {
        if ($average >= 16) return 'Très Bien';
        if ($average >= 14) return 'Bien';
        if ($average >= 12) return 'Assez Bien';
        if ($average >= 10) return 'Passable';
        return 'Insuffisant';
    }

    private function currentStudentEvents(int $studentId): array
    {
        $events = [];
        $deposits = Depot::where('etudiant_id', $studentId)->orderBy('id')->get();

        foreach ($deposits as $deposit) {
            $label = $deposit->type === 'theme' ? 'thème' : 'mémoire';
            $events[] = [
                'user_id' => $studentId,
                'event_key' => "deposit:{$deposit->id}:submitted",
                'type' => 'depot_recu',
                'title' => 'Dépôt reçu',
                'message' => "Votre dépôt de {$label} a été transmis.",
                'occurred_at' => $deposit->submitted_at ?? $deposit->created_at,
            ];

            if (in_array($deposit->status, ['valide', 'rejete'], true)) {
                $approved = $deposit->status === 'valide';
                $events[] = [
                    'user_id' => $studentId,
                    'event_key' => "deposit:{$deposit->id}:{$deposit->status}",
                    'type' => $approved ? 'depot_valide' : 'depot_refuse',
                    'title' => $approved ? 'Dépôt validé' : 'Dépôt à corriger',
                    'message' => $deposit->remarque ?: ($approved
                        ? "Votre dépôt de {$label} a été validé."
                        : "Votre dépôt de {$label} a été refusé.") ,
                    'occurred_at' => $deposit->validated_at ?? $deposit->updated_at,
                ];
            }
        }

        $defenses = Soutenance::with('evaluations')
            ->whereHas('depot', fn ($query) => $query
                ->where('etudiant_id', $studentId)
                ->where('type', 'memoire'))
            ->get();

        foreach ($defenses as $defense) {
            if ($defense->status !== 'annulee') {
                $events[] = [
                    'user_id' => $studentId,
                    'event_key' => "defense:{$defense->id}:updated:{$defense->updated_at->timestamp}",
                    'type' => 'soutenance_planifiee',
                    'title' => 'Soutenance planifiée',
                    'message' => 'Les informations de votre soutenance sont disponibles.',
                    'occurred_at' => $defense->updated_at,
                ];
            }

            $published = $this->publishedEvaluations($defense);
            if ($defense->status === 'terminee' && $published->isNotEmpty()) {
                foreach ([
                    ['resultat_disponible', 'Résultat disponible', 'Votre résultat de soutenance est disponible.', 'result'],
                    ['pv_disponible', 'PV disponible', 'Votre procès-verbal de soutenance est disponible.', 'pv'],
                ] as [$type, $title, $message, $suffix]) {
                    $events[] = [
                        'user_id' => $studentId,
                        'event_key' => "defense:{$defense->id}:{$suffix}",
                        'type' => $type,
                        'title' => $title,
                        'message' => $message,
                        'occurred_at' => $defense->updated_at,
                    ];
                }
            }
        }

        return $events;
    }
}