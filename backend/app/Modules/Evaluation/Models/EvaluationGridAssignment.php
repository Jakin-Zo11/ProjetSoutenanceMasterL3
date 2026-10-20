<?php

namespace App\Modules\Evaluation\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationGridAssignment extends Model
{
    protected $fillable = ['defense_id', 'evaluation_grid_id'];

    public function grid()
    {
        return $this->belongsTo(EvaluationGrid::class, 'evaluation_grid_id');
    }
}
