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
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');

            $table->string('cep', 8);
            $table->string('street');
            $table->string('number', 10);
            $table->string('neighborhood')->nullable();
            $table->string('city');
            $table->string('state', 2);

            $table->unsignedTinyInteger('bedrooms')->default(0);
            $table->unsignedTinyInteger('suites')->default(0);
            $table->unsignedTinyInteger('kitchens')->default(0);
            $table->unsignedTinyInteger('laundry_rooms')->default(0);
            $table->unsignedTinyInteger('living_rooms')->default(0);
            $table->unsignedTinyInteger('dining_rooms')->default(0);
            $table->unsignedTinyInteger('bathrooms')->default(0);
            $table->unsignedTinyInteger('half_bathrooms')->default(0);
            $table->unsignedTinyInteger('pantries')->default(0);

            $table->json('features');
            $table->json('nearby_places');

            $table->timestamps();

            $table->index(['state', 'city']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
