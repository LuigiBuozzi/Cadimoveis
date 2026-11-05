<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // Nullable only for listings created before these fields existed;
            // new and edited listings must fill them in.
            $table->string('deal')->nullable()->after('status')->index();
            $table->unsignedBigInteger('price')->nullable()->after('deal')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex(['deal']);
            $table->dropIndex(['price']);
            $table->dropColumn(['deal', 'price']);
        });
    }
};
