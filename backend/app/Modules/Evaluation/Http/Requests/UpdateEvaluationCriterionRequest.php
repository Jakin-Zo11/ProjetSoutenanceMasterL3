<?php

namespace App\Modules\Evaluation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvaluationCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'max_score' => ['sometimes', 'required', 'numeric', 'gt:0', 'max:9999.99'],
            'coefficient' => ['sometimes', 'required', 'numeric', 'gt:0', 'max:99999.999'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
