<?php

Schema::create('indisponibilites', function (Blueprint $table) {
    $table->id();
    $table->foreignId('enseignant_id')->constrained()->onDelete('cascade');
    $table->date('date');
    $table->time('heure_debut');
    $table->time('heure_fin');
    $table->string('motif')->nullable();
    $table->timestamps();
});
