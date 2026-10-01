<?php

namespace Database\Seeders;

use App\Models\Depot;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\Promotion;
use App\Models\Room;
use App\Models\SessionSoutenance;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Créer les salles
        $this->command->info('Création des salles...');
        $salles = [
            ['name' => 'Amphi A', 'building' => 'Bâtiment A', 'capacity' => 100, 'is_active' => true],
            ['name' => 'Amphi B', 'building' => 'Bâtiment A', 'capacity' => 80, 'is_active' => true],
            ['name' => 'Salle Master 1', 'building' => 'Bâtiment B', 'capacity' => 30, 'is_active' => true],
            ['name' => 'Salle Master 2', 'building' => 'Bâtiment B', 'capacity' => 30, 'is_active' => true],
            ['name' => 'Salle Conférence', 'building' => 'Bâtiment C', 'capacity' => 50, 'is_active' => true],
        ];

        foreach ($salles as $salle) {
            Room::firstOrCreate(['name' => $salle['name']], $salle);
        }

        // 2. Créer les formations
        $this->command->info('Création des formations...');
        $formations = [
            ['code' => 'IG', 'name' => 'Informatique de Gestion', 'description' => 'Filière Informatique de Gestion'],
            ['code' => 'GB', 'name' => 'Génie Biologique', 'description' => 'Filière Génie Biologique'],
            ['code' => 'STR', 'name' => 'Sciences et Techniques de l\'Eau', 'description' => 'Filière Sciences et Techniques de l\'Eau'],
        ];

        foreach ($formations as $formation) {
            Formation::firstOrCreate(['code' => $formation['code']], $formation);
        }

        // 3. Créer les promotions
        $this->command->info('Création des promotions...');
        $formationIG = Formation::where('code', 'IG')->first();
        $formationGB = Formation::where('code', 'GB')->first();
        $formationSTR = Formation::where('code', 'STR')->first();

        $promotions = [
            ['formation_id' => $formationIG->id, 'year' => '2025-2026', 'name' => 'Promotion 15'],
            ['formation_id' => $formationIG->id, 'year' => '2024-2025', 'name' => 'Promotion 14'],
            ['formation_id' => $formationGB->id, 'year' => '2025-2026', 'name' => 'Promotion 15'],
            ['formation_id' => $formationSTR->id, 'year' => '2025-2026', 'name' => 'Promotion 15'],
        ];

        foreach ($promotions as $promotion) {
            Promotion::firstOrCreate(['name' => $promotion['name'], 'formation_id' => $promotion['formation_id']], $promotion);
        }

        // 4. Créer les étudiants
        $this->command->info('Création des étudiants...');
        $promotionIG15 = Promotion::where('name', 'Promotion 15')->whereHas('formation', function ($q) { $q->where('code', 'IG'); })->first();
        $promotionGB15 = Promotion::where('name', 'Promotion 15')->whereHas('formation', function ($q) { $q->where('code', 'GB'); })->first();
        $promotionSTR15 = Promotion::where('name', 'Promotion 15')->whereHas('formation', function ($q) { $q->where('code', 'STR'); })->first();

        $etudiants = [
            ['name' => 'Etudiant 1', 'email' => 'etudiant1@test.com', 'password' => 'password123', 'matricule' => 'MAT001', 'promotion_id' => $promotionIG15->id],
            ['name' => 'Etudiant 2', 'email' => 'etudiant2@test.com', 'password' => 'password123', 'matricule' => 'MAT002', 'promotion_id' => $promotionIG15->id],
            ['name' => 'Etudiant 3', 'email' => 'etudiant3@test.com', 'password' => 'password123', 'matricule' => 'MAT003', 'promotion_id' => $promotionIG15->id],
            ['name' => 'Etudiant 4', 'email' => 'etudiant4@test.com', 'password' => 'password123', 'matricule' => 'MAT004', 'promotion_id' => $promotionIG15->id],
            ['name' => 'Etudiant 5', 'email' => 'etudiant5@test.com', 'password' => 'password123', 'matricule' => 'MAT005', 'promotion_id' => $promotionGB15->id],
            ['name' => 'Etudiant 6', 'email' => 'etudiant6@test.com', 'password' => 'password123', 'matricule' => 'MAT006', 'promotion_id' => $promotionGB15->id],
            ['name' => 'Etudiant 7', 'email' => 'etudiant7@test.com', 'password' => 'password123', 'matricule' => 'MAT007', 'promotion_id' => $promotionGB15->id],
            ['name' => 'Etudiant 8', 'email' => 'etudiant8@test.com', 'password' => 'password123', 'matricule' => 'MAT008', 'promotion_id' => $promotionSTR15->id],
            ['name' => 'Etudiant 9', 'email' => 'etudiant9@test.com', 'password' => 'password123', 'matricule' => 'MAT009', 'promotion_id' => $promotionSTR15->id],
            ['name' => 'Etudiant 10', 'email' => 'etudiant10@test.com', 'password' => 'password123', 'matricule' => 'MAT010', 'promotion_id' => $promotionSTR15->id],
        ];

        foreach ($etudiants as $etudiant) {
            $user = User::firstOrCreate(['email' => $etudiant['email']], [
                'name' => $etudiant['name'],
                'password' => Hash::make($etudiant['password']),
                'matricule' => $etudiant['matricule'],
                'status' => 'actif',
            ]);
            if (!$user->hasRole('etudiant')) {
                $user->assignRole('etudiant');
            }
        }

        // 5. Créer les enseignants avec rôles
        $this->command->info('Création des enseignants...');
        $enseignants = [
            ['name' => 'Prof. Dupont', 'email' => 'dupont@test.com', 'password' => 'password123', 'role' => 'president_jury'],
            ['name' => 'Prof. Martin', 'email' => 'martin@test.com', 'password' => 'password123', 'role' => 'president_jury'],
            ['name' => 'Prof. Bernard', 'email' => 'bernard@test.com', 'password' => 'password123', 'role' => 'rapporteur'],
            ['name' => 'Prof. Petit', 'email' => 'petit@test.com', 'password' => 'password123', 'role' => 'rapporteur'],
            ['name' => 'Prof. Robert', 'email' => 'robert@test.com', 'password' => 'password123', 'role' => 'examinateur'],
            ['name' => 'Prof. Richard', 'email' => 'richard@test.com', 'password' => 'password123', 'role' => 'examinateur'],
        ];

        $juryUsers = [];
        foreach ($enseignants as $enseignant) {
            $user = User::firstOrCreate(['email' => $enseignant['email']], [
                'name' => $enseignant['name'],
                'password' => Hash::make($enseignant['password']),
                'status' => 'actif',
            ]);
            if (!$user->hasRole($enseignant['role'])) {
                $user->assignRole($enseignant['role']);
            }
            $juryUsers[$enseignant['role']][] = $user;
        }

        // 6. Créer une session de soutenance
        $this->command->info('Création de la session de soutenance...');
        SessionSoutenance::firstOrCreate(['title' => 'Session de Soutenance Septembre 2026'], [
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(14),
            'status' => 'planifiee',
        ]);

        // 7. Créer les dépôts validés
        $this->command->info('Création des dépôts...');
        $etudiant1 = User::where('email', 'etudiant1@test.com')->first();
        $etudiant2 = User::where('email', 'etudiant2@test.com')->first();
        $etudiant3 = User::where('email', 'etudiant3@test.com')->first();
        $etudiant4 = User::where('email', 'etudiant4@test.com')->first();
        $etudiant5 = User::where('email', 'etudiant5@test.com')->first();

        $depots = [
            ['etudiant_id' => $etudiant1->id, 'promotion_id' => $promotionIG15->id, 'title' => 'Système de Gestion de Soutenances'],
            ['etudiant_id' => $etudiant2->id, 'promotion_id' => $promotionIG15->id, 'title' => 'Application Mobile de Réservation'],
            ['etudiant_id' => $etudiant3->id, 'promotion_id' => $promotionIG15->id, 'title' => 'Plateforme E-learning'],
            ['etudiant_id' => $etudiant4->id, 'promotion_id' => $promotionIG15->id, 'title' => 'Analyse de Données avec Machine Learning'],
            ['etudiant_id' => $etudiant5->id, 'promotion_id' => $promotionGB15->id, 'title' => 'Étude des Microorganismes'],
        ];

        $createdDepots = [];
        foreach ($depots as $depot) {
            $newDepot = Depot::firstOrCreate(['title' => $depot['title'], 'etudiant_id' => $depot['etudiant_id']], [
                'promotion_id' => $depot['promotion_id'],
                'file_path' => '/storage/memoires/' . strtolower(str_replace(' ', '_', $depot['title'])) . '.pdf',
                'status' => 'valide',
                'submitted_at' => now()->subDays(10),
                'validated_at' => now()->subDays(5),
            ]);
            $createdDepots[] = $newDepot;
        }

        // 8. Créer les soutenances
        $this->command->info('Création des soutenances...');
        $salle1 = Room::where('name', 'Salle Master 1')->first();
        $salle2 = Room::where('name', 'Salle Master 2')->first();
        $salle3 = Room::where('name', 'Salle Conférence')->first();

        $president1 = $juryUsers['president_jury'][0];
        $rapporteur1 = $juryUsers['rapporteur'][0];
        $examinateur1 = $juryUsers['examinateur'][0];

        $soutenances = [
            [
                'depot_id'    => $createdDepots[0]->id,
                'etudiant_id' => $createdDepots[0]->etudiant_id,
                'salle_id'    => $salle1?->id,
                'theme'       => $createdDepots[0]->title,
                'date_debut'  => now()->addDays(8)->setHour(9)->setMinute(0),
                'date_fin'    => now()->addDays(8)->setHour(10)->setMinute(0),
                'statut'      => 'planifiee',
            ],
            [
                'depot_id'    => $createdDepots[1]->id,
                'etudiant_id' => $createdDepots[1]->etudiant_id,
                'salle_id'    => $salle2?->id,
                'theme'       => $createdDepots[1]->title,
                'date_debut'  => now()->addDays(8)->setHour(11)->setMinute(0),
                'date_fin'    => now()->addDays(8)->setHour(12)->setMinute(0),
                'statut'      => 'planifiee',
            ],
            [
                'depot_id'    => $createdDepots[2]->id,
                'etudiant_id' => $createdDepots[2]->etudiant_id,
                'salle_id'    => $salle3?->id,
                'theme'       => $createdDepots[2]->title,
                'date_debut'  => now()->addDays(9)->setHour(14)->setMinute(0),
                'date_fin'    => now()->addDays(9)->setHour(15)->setMinute(0),
                'statut'      => 'planifiee',
            ],
        ];

        $soutenanceIds = [];
        foreach ($soutenances as $soutenance) {
            $newSoutenance = Soutenance::firstOrCreate(['depot_id' => $soutenance['depot_id']], $soutenance);
            $soutenanceIds[] = $newSoutenance->id;
        }

        // 9. Créer des évaluations de démonstration
        $this->command->info('Création des évaluations...');
        $evaluations = [
            [
                'soutenance_id' => $soutenanceIds[0],
                'jury_user_id' => $president1->id,
                'note_presentation' => 15.5,
                'note_manuscrit' => 16.0,
                'note_reponses' => 14.5,
                'remarques' => 'Très bon travail, présentation claire.',
                'status' => 'valide',
            ],
            [
                'soutenance_id' => $soutenanceIds[0],
                'jury_user_id' => $rapporteur1->id,
                'note_presentation' => 14.0,
                'note_manuscrit' => 15.0,
                'note_reponses' => 15.5,
                'remarques' => 'Mémoire bien structuré, réponses pertinentes.',
                'status' => 'valide',
            ],
            [
                'soutenance_id' => $soutenanceIds[0],
                'jury_user_id' => $examinateur1->id,
                'note_presentation' => 15.0,
                'note_manuscrit' => 14.5,
                'note_reponses' => 15.0,
                'remarques' => 'Bonne maîtrise du sujet.',
                'status' => 'valide',
            ],
        ];

        foreach ($evaluations as $evaluation) {
            $eval = Evaluation::firstOrCreate([
                'soutenance_id' => $evaluation['soutenance_id'],
                'jury_user_id' => $evaluation['jury_user_id']
            ], $evaluation);
            
            if (!$eval->note_finale && method_exists($eval, 'calculerNoteFinale')) {
                $eval->calculerNoteFinale();
                $eval->save();
            }
        }

        $this->command->info('Données de démonstration créées avec succès !');
    }
}