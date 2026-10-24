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
    public function up(): void
{
    Schema::table('soutenances', function (Blueprint $table) {
        $table->timestamp('valide_le')->nullable();
        $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('soutenances', function (Blueprint $table) {
        $table->dropForeign(['valide_par']);
        $table->dropColumn(['valide_par', 'valide_le']);
    });
}
};
