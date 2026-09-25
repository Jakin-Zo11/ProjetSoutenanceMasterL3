<?php
// database/migrations/xxxx_xx_xx_create_soutenances_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soutenances', function (Blueprint $table) {
            $table->id();

            // TODO: transformer en foreignId()->constrained() une fois
            // les tables etudiants et salles confirmees par Dannielah/Ntsoa
            $table->unsignedBigInteger('etudiant_id')->index();
            $table->unsignedBigInteger('salle_id')->nullable()->index();

            $table->string('theme')->nullable();
            $table->dateTime('date_debut')->nullable();
            $table->dateTime('date_fin')->nullable();

            $table->enum('statut', [
                'en_attente',
                'planifiee',
                'en_cours',
                'terminee',
                'annulee',
            ])->default('en_attente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soutenances');
    }
};