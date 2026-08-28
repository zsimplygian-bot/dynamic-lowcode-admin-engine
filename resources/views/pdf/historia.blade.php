<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica #{{ $historia->id }}</title>
    <style>
        @page { margin: 8mm 10mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; line-height: 1.3; }
        .header { width: 100%; margin-bottom: 15px; }
        .header table { width: 100%; border: none; margin: 0; }
        .header td { border: none; padding: 0; vertical-align: middle; }
        .title { font-size: 18px; font-weight: bold; text-align: center; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data-table th, table.data-table td { border: 1px solid #999; padding: 4px 8px; vertical-align: top; }
        table.data-table th { background: #f0f0f0; font-weight: bold; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .paciente-col { width: 16.66%; }
    </style>
</head>
<body>

<div class="header">
    <table>
        <tr>
            <td width="20%">
                @if($logo)
                    <img src="{{ $logo }}" alt="Logo" style="height: 55px; width: auto;" />
                @endif
            </td>
            <td width="60%" class="title">HISTORIA CLÍNICA #{{ $historia->id }}</td>
            <td width="20%" class="text-right" style="font-size: 10px;">
                <b>Fecha:</b> {{ $historia->created_at?->format('d/m/Y H:i') ?? 'N/A' }}
            </td>
        </tr>
    </table>
</div>

<table class="data-table">
    <thead>
        <tr><th colspan="3">Datos del Propietario</th></tr>
    </thead>
    <tbody>
        <tr>
            <td width="35%"><b>Nombres:</b> {{ $cliente?->cliente ?? 'N/A' }}</td>
            <td width="25%"><b>Teléfono:</b> {{ $cliente?->telefono ?? 'N/A' }}</td>
            <td width="40%"><b>Dirección:</b> {{ $cliente?->direccion ?? 'N/A' }}</td>
        </tr>
    </tbody>
</table>

<table class="data-table">
    <thead>
        <tr><th colspan="6">Datos del Paciente</th></tr>
    </thead>
    <tbody>
        <tr>
            <td class="paciente-col"><b>Nombre:</b> {{ $mascota?->mascota ?? 'N/A' }}</td>
            <td class="paciente-col"><b>Especie:</b> {{ $mascota?->raza?->especie?->especie ?? 'N/A' }}</td>
            <td class="paciente-col"><b>Raza:</b> {{ $mascota?->raza?->raza ?? 'N/A' }}</td>
            <td class="paciente-col"><b>Peso:</b> {{ $mascota?->peso ? $mascota->peso.' kg' : 'N/A' }}</td>
            <td class="paciente-col"><b>Sexo:</b> {{ $mascota?->sexo?->sexo ?? 'N/A' }}</td>
            <td class="paciente-col"><b>Edad:</b> {{ $edadFmt }}</td>
        </tr>
    </tbody>
</table>

<table class="data-table">
    <thead>
        <tr>
            <th width="30%">Motivo</th>
            <th width="50%">Detalle del Motivo</th>
            <th width="20%">Estado</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{{ $historia->motivo?->motivo ?? 'N/A' }}</td>
            <td>{{ $historia->detalle ?? 'N/A' }}</td>
            <td>{{ $historia->estado_historia?->estado_historia ?? 'N/A' }}</td>
        </tr>
    </tbody>
</table>

<table class="data-table">
    <thead>
        <tr>
            <th width="20%">Fecha</th>
            <th width="20%">Tipo</th>
            <th width="60%">Descripción / Detalles</th>
        </tr>
    </thead>
    <tbody>
        @forelse($actividades as $a)
            <tr>
                <td>{{ $a['fecha_raw'] ? \Carbon\Carbon::parse($a['fecha_raw'])->format('d/m/Y H:i') : 'N/A' }}</td>
                <td><b>{{ $a['tipo'] }}</b></td>
                <td>
                    @foreach($a['detalle'] as $linea)
                        {{ $linea }}<br>
                    @endforeach
                </td>
            </tr>
        @empty
            <tr><td colspan="3" class="text-center">No hay actividades registradas en esta historia clínica.</td></tr>
        @endforelse
        <tr>
            <td colspan="2" class="text-right" style="font-weight:bold; background:#fafafa;">Total Acumulado:</td>
            <td style="font-weight:bold; background:#fafafa;">S/ {{ number_format($total, 2) }}</td>
        </tr>
    </tbody>
</table>

</body>
</html>