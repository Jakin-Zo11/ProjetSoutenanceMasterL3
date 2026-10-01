<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('soutenances', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères
            $table->foreignId('depot_id')->constrained('depots')->onDelete('cascade');
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('salle_id')->nullable()->constrained('rooms')->nullOnDelete();
            
            // Informations de la soutenance
            $table->string('theme')->nullable();
            $table->dateTime('date_debut')->nullable();
            $table->dateTime('date_fin')->nullable();
            
            // Statut
            $table->enum('statut', ['en_attente', 'planifiee', 'en_cours', 'terminee', 'annulee'])
                  ->default('en_attente');
                  
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('soutenances');
    }
};