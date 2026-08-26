<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica PDF</title>
    <style>
        @page { margin: 10mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; margin: 0; }
        .header { position: relative; text-align: center; padding: 20px 0; }
        .logo { position: absolute; left: 20px; top: 0; }
        .logo img { width: 80px; }
        .title { font-size: 22px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 5px 10px; vertical-align: top; }
        th { background: #f2f2f2; font-weight: bold; }
        .fecha { text-align: right; font-weight: bold; }
        .paciente { width: 16%; }
    </style>
</head>
<body>

<div class="header">
    <div class="logo">
        <img src="{{ $logo }}" alt="Logo" style="height: 60px; width: auto;" />
    </div>
    <div class="title">HISTORIA CLÍNICA</div>
</div>

<table>
    <thead>
        <tr>
            <th colspan="2">Datos del propietario</th>
            <th class="fecha">Fecha: {{ $historia->created_at?->format('d/m/Y H:i') ?? 'N/A' }}</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><b>Nombres:</b> {{ $cliente?->cliente ?? 'N/A' }}</td>
            <td><b>Teléfono:</b> {{ $cliente?->telefono ?? 'N/A' }}</td>
            <td><b>Dirección:</b> {{ $cliente?->direccion ?? 'N/A' }}</td>
        </tr>
    </tbody>
</table>

<table>
    <thead>
        <tr><th colspan="6">Datos del paciente</th></tr>
    </thead>
    <tbody>
        <tr>
            <td class="paciente"><b>Nombre:</b> {{ $mascota?->mascota ?? 'N/A' }}</td>
            <td class="paciente"><b>Especie:</b> {{ $mascota?->raza?->especie?->especie ?? 'N/A' }}</td>
            <td class="paciente"><b>Raza:</b> {{ $mascota?->raza?->raza ?? 'N/A' }}</td>
            <td class="paciente"><b>Peso:</b> {{ $mascota?->peso ? $mascota->peso.' kg' : 'N/A' }}</td>
            <td class="paciente"><b>Sexo:</b> {{ $mascota?->sexo?->sexo ?? 'N/A' }}</td>
            <td class="paciente"><b>Edad:</b> {{ $edadFmt }}</td>
        </tr>
    </tbody>
</table>

<table>
    <thead>
        <tr>
            <th width="30%">Motivo de historia</th>
            <th width="50%">Detalle de motivo</th>
            <th width="20%">Estado historia</th>
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

<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
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
            <tr>
                <td colspan="3" style="text-align:center">No hay actividades</td>
            </tr>
        @endforelse
        <tr>
            <td colspan="2" style="text-align:right;font-weight:bold">Total S/</td>
            <td style="font-weight:bold">{{ number_format($total, 2) }}</td>
        </tr>
    </tbody>
</table>

</body>
</html>