<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('database_history')) {
            Schema::create('database_history', function (Blueprint $table) {
                $table->id();
                $table->enum('action', ['import', 'export']);
                $table->string('filename', 255)->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('database_history');
        Schema::dropIfExists('navigation');
    }
};