<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navigation', function (Blueprint $table) {
            $table->increments('id_navigation');
            $table->string('navigation', 50);
            $table->string('path', 255)->nullable();
            $table->string('emoji_navigation', 255)->nullable()->comment('label: ICONO');
            $table->integer('order_index')->default(0)->nullable();
            $table->integer('parent')->default(0)->nullable();
            $table->integer('creater_id');
            $table->integer('updater_id')->nullable();
            $table->timestamps();
        });
        Schema::create('database_history', function (Blueprint $table) {
            $table->increments(id);
            $table->enum('action', ['import', 'export']);
            $table->string('filename', 255)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('database_history');
        Schema::dropIfExists('navigation');
    }
};