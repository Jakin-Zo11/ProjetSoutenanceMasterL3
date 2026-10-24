<?php

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
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    protected static function booted(): void
{
    $invalider = function (AffectationJury $a) {
        Soutenance::where('id', $a->soutenance_id)
            ->whereNotNull('valide_le')
            ->update(['valide_le' => null, 'valide_par' => null]);
    };

    static::saved($invalider);
    static::deleted($invalider);
}
}