<?php

namespace App\Modules\Evaluation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_score' => ['required', 'numeric', 'gt:0', 'max:9999.99'],
            'coefficient' => ['required', 'numeric', 'gt:0', 'max:99999.999'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
