<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Convocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'soutenance_id',
        'contenu',
        'generee_le',
    ];

    protected $casts = [
        'generee_le' => 'datetime',
    ];

    public function soutenance()
    {
        return $this->belongsTo(Soutenance::class);
    }
}