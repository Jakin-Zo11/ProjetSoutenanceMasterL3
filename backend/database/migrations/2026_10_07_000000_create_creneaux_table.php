<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('creneaux', function (Blueprint $table) {
            $table->id();
            $table->string('reference');
            $table->string('heure_debut');
            $table->string('heure_fin');
            $table->json('jours');
            $table->enum('type', ['Matin', 'Après-midi']);
            $table->integer('capacite');
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creneaux');
    }
};