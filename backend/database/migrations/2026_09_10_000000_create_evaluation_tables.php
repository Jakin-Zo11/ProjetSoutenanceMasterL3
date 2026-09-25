<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('evaluation_grids', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('evaluation_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_grid_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('max_score', 6, 2);
            $table->decimal('coefficient', 8, 3)->default(1);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('defense_evaluations', function (Blueprint $table) {
            $table->id();
            // The Planning module owns the defenses table. Keep this loose coupling until it is delivered.
            $table->unsignedBigInteger('defense_id')->index();
            $table->foreignId('jury_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('evaluation_grid_id')->constrained()->restrictOnDelete();
            $table->enum('status', ['draft', 'validated', 'locked'])->default('draft');
            $table->decimal('total_score', 8, 2)->nullable();
            $table->decimal('weighted_score', 10, 4)->nullable();
            $table->text('comment')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();
            $table->unique(['defense_id', 'jury_id']);
        });

        Schema::create('evaluation_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('defense_evaluation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluation_criterion_id')->constrained()->restrictOnDelete();
            $table->decimal('score', 6, 2);
            $table->decimal('weighted_score', 10, 4);
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['defense_evaluation_id', 'evaluation_criterion_id'], 'eval_scores_def_crit_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('evaluation_scores');
        Schema::dropIfExists('defense_evaluations');
        Schema::dropIfExists('evaluation_criteria');
        Schema::dropIfExists('evaluation_grids');
    }
};
