<?php
// database/migrations/xxxx_xx_xx_create_affectation_jury_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectation_jury', function (Blueprint $table) {
            $table->id();
            $table->foreignId('soutenance_id')->constrained('soutenances')->cascadeOnDelete();
            $table->foreignId('enseignant_id')->constrained('users')->onDelete('cascade');

            $table->enum('role', ['president', 'rapporteur', 'examinateur']);

            $table->timestamps();

            // Un enseignant ne peut avoir qu'un seul role par soutenance
            $table->unique(['soutenance_id', 'enseignant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectation_jury');
    }
};