<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('convocations', function (Blueprint $table) {
            $table->dateTime('diffusee_le')->nullable()->after('generee_le');
            $table->foreignId('diffusee_par')->nullable()->after('diffusee_le')
                  ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('convocations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('diffusee_par');
            $table->dropColumn('diffusee_le');
        });
    }
};
