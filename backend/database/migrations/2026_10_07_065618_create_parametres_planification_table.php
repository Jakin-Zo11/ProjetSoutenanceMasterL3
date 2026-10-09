<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parametres_planification', function (Blueprint $table) {
            $table->id();
            $table->time('heure_debut_journee')->default('08:00:00');
            $table->time('heure_fin_journee')->default('17:00:00');
            $table->unsignedInteger('duree_minutes')->default(60);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parametres_planification');
    }
};