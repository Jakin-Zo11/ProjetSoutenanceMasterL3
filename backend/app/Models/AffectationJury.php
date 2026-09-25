<?php
// app/Models/AffectationJury.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffectationJury extends Model
{
    use HasFactory;

    protected $table = 'affectation_jury';

    protected $fillable = [
        'soutenance_id',
        'enseignant_id',
        'role',
    ];

    public function soutenance()
    {
        return $this->belongsTo(Soutenance::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }
}