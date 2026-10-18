<?php

namespace App\Modules\Evaluation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignEvaluationGridRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'evaluation_grid_id' => ['required', 'integer', 'exists:evaluation_grids,id'],
        ];
    }
}
