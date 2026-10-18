<?php

namespace App\Modules\Evaluation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDefenseEvaluationScoresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comment' => ['nullable', 'string'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.criterion_id' => ['required', 'integer', 'distinct', 'exists:evaluation_criteria,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'scores.*.comment' => ['nullable', 'string'],
        ];
    }
}
