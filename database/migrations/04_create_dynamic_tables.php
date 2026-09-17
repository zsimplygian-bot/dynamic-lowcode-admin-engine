<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Blueprint::macro('auditFields', function () {
            $this->integer('creater_id');
            $this->integer('updater_id')->nullable();
            $this->timestamps();
        });
        Schema::create('categoria_procedimiento', function (Blueprint $table) {
            $table->increments('id_categoria_procedimiento');
            $table->string('categoria_procedimiento', 50);
            $table->text('emoji_categoria_procedimiento')->nullable();
            $table->auditFields();
        });
        Schema::create('categoria_producto', function (Blueprint $table) {
            $table->increments('id_categoria_producto');
            $table->string('categoria_producto', 50);
            $table->text('emoji_categoria_producto')->nullable();
            $table->auditFields();
        });
        Schema::create('cita', function (Blueprint $table) {
            $table->increments('id_cita');
            $table->string('cita', 255)->nullable();
            $table->integer('id_mascota');
            $table->dateTime('fecha')->nullable();
            $table->dateTime('fecha_hora_atencion')->nullable();
            $table->dateTime('fecha_hora_notificacion')->nullable();
            $table->integer('id_motivo');
            $table->text('observaciones')->nullable();
            $table->enum('estado_cita', ['PENDIENTE', 'ATENDIDO', 'CANCELADO'])->default('PENDIENTE');
            $table->auditFields();
        });
        Schema::create('cliente', function (Blueprint $table) {
            $table->increments('id_cliente');
            $table->string('cliente', 255);
            $table->string('dni', 8)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('telefono', 9)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->text('observaciones')->nullable();
            $table->auditFields();
        });
        Schema::create('especie', function (Blueprint $table) {
            $table->increments('id_especie');
            $table->string('especie', 100);
            $table->text('emoji_especie')->nullable();
            $table->auditFields();
        });
        Schema::create('historia', function (Blueprint $table) {
            $table->increments('id_historia');
            $table->text('historia')->nullable();
            $table->integer('id_mascota');
            $table->dateTime('fecha');
            $table->integer('id_motivo');
            $table->text('observaciones')->nullable();
            $table->enum('estado_historia', ['ABIERTO', 'EN OBSERVACION', 'REFERIDO', 'CERRADO'])->default('ABIERTO');
            $table->auditFields();
        });
        Schema::create('historia_anamnesis', function (Blueprint $table) {
            $table->increments('id_historia_anamnesis');
            $table->text('historia_anamnesis')->nullable();
            $table->integer('id_historia');
            $table->dateTime('fecha')->nullable();
            $table->time('hora')->nullable();
            $table->float('temperatura');
            $table->float('frecuencia_cardiaca')->nullable();
            $table->integer('frecuencia_respiratoria')->nullable();
            $table->float('tiempo_llenado_capilar')->nullable();
            $table->float('peso')->nullable();
            $table->text('archivo')->nullable();
            $table->text('observaciones')->nullable();
            $table->auditFields();
        });
        Schema::create('historia_procedimiento', function (Blueprint $table) {
            $table->increments('id_historia_procedimiento');
            $table->text('historia_procedimiento')->nullable();
            $table->integer('id_historia');
            $table->integer('id_procedimiento');
            $table->dateTime('fecha')->nullable();
            $table->float('precio');
            $table->text('detalle')->nullable();
            $table->text('archivo')->nullable();
            $table->auditFields();
        });
        Schema::create('historia_producto', function (Blueprint $table) {
            $table->increments('id_historia_producto');
            $table->text('historia_producto')->nullable();
            $table->integer('id_historia');
            $table->integer('id_producto')->nullable();
            $table->dateTime('fecha')->nullable();
            $table->string('dosis', 50)->nullable();
            $table->float('precio')->nullable();
            $table->string('duracion', 50)->nullable();
            $table->text('archivo')->nullable();
            $table->text('observaciones')->nullable();
            $table->auditFields();
        });
        Schema::create('historia_producto_dosis', function (Blueprint $table) {
            $table->increments('id_historia_producto_dosis');
            $table->text('historia_producto_dosis')->nullable();
            $table->integer('id_historia_producto');
            $table->integer('id_producto');
            $table->integer('cantidad');
            $table->string('unidad', 10);
            $table->string('via', 50);
            $table->string('frecuencia', 50);
            $table->dateTime('fecha');
            $table->auditFields();
        });
        Schema::create('historia_seguimiento', function (Blueprint $table) {
            $table->increments('id_historia_seguimiento');
            $table->text('historia_seguimiento')->nullable();
            $table->integer('id_historia');
            $table->dateTime('fecha')->nullable();
            $table->text('detalle')->nullable();
            $table->text('observaciones')->nullable();
            $table->text('archivo')->nullable();
            $table->auditFields();
        });
        Schema::create('mascota', function (Blueprint $table) {
            $table->increments('id_mascota');
            $table->string('mascota', 255);
            $table->integer('id_cliente');
            $table->integer('id_raza')->nullable();
            $table->enum('sexo', ['MACHO', 'HEMBRA'])->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->tinyInteger('fecha_nacimiento_estimada')->default(0);
            $table->string('color', 100)->default('');
            $table->decimal('peso', 5, 2)->nullable();
            $table->tinyInteger('activo')->default(1);
            $table->text('observaciones')->nullable();
            $table->text('archivo')->nullable();
            $table->auditFields();
        });
        Schema::create('motivo', function (Blueprint $table) {
            $table->increments('id_motivo');
            $table->string('motivo', 50);
            $table->text('emoji_motivo')->nullable();
            $table->auditFields();
        });
        Schema::create('procedimiento', function (Blueprint $table) {
            $table->increments('id_procedimiento');
            $table->string('procedimiento', 255);
            $table->text('descripcion')->nullable();
            $table->integer('id_categoria_procedimiento');
            $table->float('precio');
            $table->auditFields();
        });
        Schema::create('producto', function (Blueprint $table) {
            $table->increments('id_producto');
            $table->string('producto', 255);
            $table->integer('id_categoria_producto');
            $table->text('descripcion')->nullable();
            $table->float('precio');
            $table->auditFields();
        });
        Schema::create('raza', function (Blueprint $table) {
            $table->increments('id_raza');
            $table->string('raza', 100);
            $table->integer('id_especie');
            $table->auditFields();
        });
        Schema::create('rfm', function (Blueprint $table) {
            $table->increments('id_rfm');
            $table->integer('id_cliente');
            $table->date('fecha_calculo');
            $table->float('recencia');
            $table->float('frecuencia');
            $table->float('valor_monetario');
            $table->integer('antiguedad');
            $table->float('ticket_promedio');
            $table->float('intervalo_visitas');
            $table->date('primera_visita');
            $table->date('ultima_visita');
            $table->enum('segmento', ['ACTIVO', 'EN RIESGO', 'INACTIVO']);
            $table->float('recencia_p')->nullable();
            $table->float('frecuencia_p')->nullable();
            $table->float('valor_monetario_p')->nullable();
            $table->date('fecha_proyectada')->nullable();
            $table->auditFields();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rfm');
        Schema::dropIfExists('raza');
        Schema::dropIfExists('producto');
        Schema::dropIfExists('procedimiento');
        Schema::dropIfExists('motivo');
        Schema::dropIfExists('mascota');
        Schema::dropIfExists('historia_seguimiento');
        Schema::dropIfExists('historia_producto_dosis');
        Schema::dropIfExists('historia_producto');
        Schema::dropIfExists('historia_procedimiento');
        Schema::dropIfExists('historia_anamnesis');
        Schema::dropIfExists('historia');
        Schema::dropIfExists('especie');
        Schema::dropIfExists('cliente');
        Schema::dropIfExists('cita');
        Schema::dropIfExists('categoria_producto');
        Schema::dropIfExists('categoria_procedimiento');
    }
};