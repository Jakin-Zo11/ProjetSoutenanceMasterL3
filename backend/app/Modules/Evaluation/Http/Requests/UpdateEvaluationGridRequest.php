<?php

namespace App\Modules\Evaluation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvaluationGridRequest extends FormRequest
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
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
