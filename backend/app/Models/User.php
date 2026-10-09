<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'telephone',
        'matricule',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Check if the user is a scolarite admin.
     *
     * @return bool
     */
    public function isAdminScolarite()
    {
        return $this->hasRole('admin_scolarite');
    }

    /**
     * Check if the user is a president of mention.
     *
     * @return bool
     */
    public function isPresidentMention()
    {
        return $this->hasRole('president_mention');
    }

    /**
     * Check if the user is a student.
     *
     * @return bool
     */
    public function isEtudiant()
    {
        return $this->hasRole('etudiant');
    }

    /**
     * Check if the user is a teacher.
     *
     * @return bool
     */
    public function isEnseignant()
    {
        return $this->hasRole('enseignant');
    }

    /**
     * Relation avec la promotion (pour les étudiants).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Dépôts de mémoire associés à l'étudiant.
     */
    public function depots(): HasMany
    {
        return $this->hasMany(Depot::class, 'etudiant_id');
    }
}
