<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('location')->nullable()->after('building');
        });

        Schema::table('promotions', function (Blueprint $table) {
            $table->string('mention')->default('')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropColumn('mention');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('location');
        });
    }
};
