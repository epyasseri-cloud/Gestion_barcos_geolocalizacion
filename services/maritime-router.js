/**
 * MaritimeRouter
 * Calcula rutas marítimas evitando masas terrestres mediante el paso
 * por pasos oceánicos predefinidos (Cabo de Hornos, Canal de Panamá,
 * Estrecho de Gibraltar, Cabo de Buena Esperanza, Canal de Suez,
 * Estrecho de Malaca).
 *
 * Dependencia: geo-utils.js (GeoUtils.interpolateGreatCircle)
 */
const MaritimeRouter = {

    // ── Waypoints de cada paso oceánico ──────────────────────────────────────
    // Cada array está ordenado de "lado A" a "lado B" del paso.
    // Para rutas inversas se invierte el array.

    // Cabo de Hornos: ordenado Pacífico → Atlántico
    WP_CAPE_HORN: [
        { lat: -50.0, lng: -75.5 },  // Oeste de Tierra del Fuego (Pacífico)
        { lat: -55.9, lng: -67.3 },  // Cabo de Hornos
        { lat: -57.5, lng: -58.5 }   // Paso Drake (Atlántico)
    ],

    // Corredor del Pacífico oriental hacia el Canal de Panamá,
    // manteniéndose mar adentro frente a Baja California, México y Centroamérica.
    // Ordenado Pacífico abierto → Atlántico/Caribe.
    WP_PANAMA: [
        { lat: 27.0, lng: -128.0 },  // Pacífico nororiental, oeste de Baja California
        { lat: 21.5, lng: -114.0 },  // Pacífico frente a Baja California Sur
        { lat: 15.0, lng: -103.0 },  // Pacífico mexicano, mar adentro
        { lat: 10.5, lng: -90.0 },   // Pacífico de Centroamérica, mar adentro
        { lat:  8.0, lng: -79.5 },   // Entrada Pacífico (Panamá)
        { lat:  9.3, lng: -79.9 }    // Salida Atlántico/Caribe (Colón)
    ],

    // Canal de Panamá + Caribe + Golfo de México.
    // Útil para puertos del Golfo como Veracruz, evitando cruzar Centroamérica/México.
    WP_PANAMA_GULF: [
        { lat: 27.0, lng: -128.0 },  // Pacífico nororiental, oeste de Baja California
        { lat: 21.5, lng: -114.0 },  // Pacífico frente a Baja California Sur
        { lat: 15.0, lng: -103.0 },  // Pacífico mexicano, mar adentro
        { lat: 10.5, lng: -90.0 },   // Pacífico de Centroamérica, mar adentro
        { lat:  8.0, lng: -79.5 },   // Entrada Pacífico
        { lat:  9.3, lng: -79.9 },   // Salida Caribe
        { lat: 15.5, lng: -81.5 },   // Caribe occidental
        { lat: 21.8, lng: -86.8 },   // Canal de Yucatán
        { lat: 22.8, lng: -92.5 }    // Golfo central occidental
    ],

    // Gibraltar: punto único
    WP_GIBRALTAR: [
        { lat: 35.9, lng: -5.6 }
    ],

    // Cabo de Buena Esperanza
    WP_GOOD_HOPE: [
        { lat: -36.5, lng: 17.5 }
    ],

    // Canal de Suez: ordenado Mediterráneo → Mar Rojo
    WP_SUEZ: [
        { lat: 31.2, lng: 32.4 },    // Entrada Mediterráneo (Port Said)
        { lat: 27.5, lng: 34.1 }     // Salida Mar Rojo (Suez)
    ],

    // Estrecho de Malaca: punto único
    WP_MALACCA: [
        { lat: 2.0, lng: 103.5 }
    ],

    // ── Clasificación de regiones oceánicas ──────────────────────────────────
    /**
     * Devuelve una cadena con la región oceánica del punto.
     * Las regiones son aproximaciones suficientes para rutas de demostración.
     */
    getRegion: function(lat, lng) {
        // Mar Mediterráneo (incluye Adriático, Egeo, Mar Negro)
        if (lat > 29  && lat < 48  && lng > -6   && lng < 42 ) return 'MED';
        // Mar Rojo
        if (lat > 12  && lat < 30  && lng > 32   && lng < 44 ) return 'RED_SEA';
        // Pacífico Sur Este (costa Pacífica de América del Sur)
        if (lat < 10  && lat > -60 && lng > -118 && lng < -68) return 'PAC_S';
        // Pacífico Norte (este del meridiano 130°E y oeste de América)
        if (lat >= 10 && lat < 72  && (lng < -84 || lng > 130)) return 'PAC_N';
        // Pacífico Sur (centro y oeste)
        if (lat < 10  && (lng < -118 || lng > 128))             return 'PAC_S';
        // Atlántico Sur (este de América del Sur)
        if (lat < 10  && lat > -58 && lng > -62  && lng < 22 ) return 'ATL_S';
        // Atlántico Norte (incluye Caribe y Golfo de México)
        if (lat >= 10 && lat < 70  && lng > -100 && lng < -5  ) return 'ATL_N';
        // Océano Índico
        if (lat > -42 && lat < 32  && lng > 20   && lng < 130 ) return 'IND';
        // Oceano Austral, Ártico u otras zonas abiertas → ruta directa
        return 'OPEN';
    },

    // ── Resolución de intermedios ─────────────────────────────────────────────
    /**
     * Dado el par de regiones (r1, r2) y las coordenadas de extremo,
     * devuelve el array de waypoints intermedios ordenados desde r1 hacia r2.
     * Devuelve [] si la ruta es directa (mismo océano o sin paso conocido).
     */
    getIntermediates: function(r1, lat1, lng1, r2, lat2, lng2) {
        var self = this;

        /**
         * cn(a, b, wps): si (r1===a && r2===b) devuelve wps tal cual;
         *                si (r1===b && r2===a) devuelve wps invertido;
         *                en otro caso devuelve null.
         */
        function cn(a, b, wps) {
            if (r1 === a && r2 === b) return wps.slice();
            if (r1 === b && r2 === a) return wps.slice().reverse();
            return null;
        }

        function isGulfPoint(lat, lng) {
            return lat >= 15 && lng <= -90;
        }

        var w;

        // ── Pacífico ↔ Atlántico (alrededor de América del Sur) ──────────────
        w = cn('PAC_S', 'ATL_S', self.WP_CAPE_HORN);  if (w) return w;
        w = cn('PAC_N', 'ATL_S', self.WP_CAPE_HORN);  if (w) return w;
        if ((r1 === 'PAC_N' && r2 === 'ATL_N') || (r1 === 'ATL_N' && r2 === 'PAC_N')) {
            var panamaRoute = (isGulfPoint(lat1, lng1) || isGulfPoint(lat2, lng2))
                ? self.WP_PANAMA_GULF
                : self.WP_PANAMA;
            return r1 === 'PAC_N' ? panamaRoute.slice() : panamaRoute.slice().reverse();
        }

        // PAC_S ↔ ATL_N: Panamá si alguno está al norte de 5°, sino Cabo de Hornos
        if ((r1 === 'PAC_S' && r2 === 'ATL_N') || (r1 === 'ATL_N' && r2 === 'PAC_S')) {
            var usePanama = Math.max(lat1, lat2) > 5;
            var passWps = usePanama
                ? ((isGulfPoint(lat1, lng1) || isGulfPoint(lat2, lng2))
                    ? self.WP_PANAMA_GULF
                    : self.WP_PANAMA)
                : self.WP_CAPE_HORN;
            return r1 === 'PAC_S' ? passWps.slice() : passWps.slice().reverse();
        }

        // ── Mediterráneo ↔ Atlántico ──────────────────────────────────────────
        w = cn('MED', 'ATL_N', self.WP_GIBRALTAR); if (w) return w;
        w = cn('MED', 'ATL_S', self.WP_GIBRALTAR); if (w) return w;

        // ── Mediterráneo ↔ Pacífico ───────────────────────────────────────────
        // MED → PAC_N: Gibraltar + travesía Atlántico N + entrada Atlántica del Canal de Panamá
        var MED_PAC_N = self.WP_GIBRALTAR.concat(
            [{ lat: 20.0, lng: -35.0 }],
            self.WP_PANAMA.slice().reverse()   // se entra por el lado Atlántico
        );
        w = cn('MED', 'PAC_N', MED_PAC_N); if (w) return w;

        // MED → PAC_S: Gibraltar + intermedio ecuatorial + entrada Atlántica del Cabo de Hornos
        var MED_PAC_S = self.WP_GIBRALTAR.concat(
            [{ lat: 5.0, lng: -20.0 }],
            self.WP_CAPE_HORN.slice().reverse()  // se entra por el lado Atlántico
        );
        w = cn('MED', 'PAC_S', MED_PAC_S); if (w) return w;

        // ── Océano Índico ─────────────────────────────────────────────────────
        w = cn('ATL_S', 'IND', self.WP_GOOD_HOPE); if (w) return w;
        w = cn('ATL_N', 'IND', self.WP_GOOD_HOPE); if (w) return w;
        w = cn('MED',   'IND', self.WP_SUEZ);      if (w) return w;
        w = cn('MED', 'RED_SEA', self.WP_SUEZ);    if (w) return w;

        // ── Índico ↔ Pacífico (Estrecho de Malaca) ────────────────────────────
        w = cn('PAC_S', 'IND', self.WP_MALACCA); if (w) return w;
        w = cn('PAC_N', 'IND', self.WP_MALACCA); if (w) return w;

        return [];
    },

    // ── Función principal ─────────────────────────────────────────────────────
    /**
     * computeRoute(lat1, lng1, lat2, lng2)
     * Devuelve un array de { lat, lng } con la ruta marítima.
     * Usa interpolación de gran círculo por segmento para suavizar la curva.
     */
    computeRoute: function(lat1, lng1, lat2, lng2) {
        var r1 = this.getRegion(lat1, lng1);
        var r2 = this.getRegion(lat2, lng2);

        // Mismo océano o zona abierta: gran círculo directo
        if (r1 === r2 || r1 === 'OPEN' || r2 === 'OPEN') {
            return GeoUtils.interpolateGreatCircle(lat1, lng1, lat2, lng2, 40);
        }

        var intermediates = this.getIntermediates(r1, lat1, lng1, r2, lat2, lng2);

        if (!intermediates || intermediates.length === 0) {
            // Sin paso conocido: ruta directa como fallback
            return GeoUtils.interpolateGreatCircle(lat1, lng1, lat2, lng2, 40);
        }

        // Construir la secuencia de puntos clave: origen → intermedios → destino
        var keypoints = [{ lat: lat1, lng: lng1 }]
            .concat(intermediates)
            .concat([{ lat: lat2, lng: lng2 }]);

        var allPoints = [];
        for (var i = 0; i < keypoints.length - 1; i++) {
            var seg = GeoUtils.interpolateGreatCircle(
                keypoints[i].lat,     keypoints[i].lng,
                keypoints[i + 1].lat, keypoints[i + 1].lng,
                20  // 20 puntos por segmento → curva suave
            );
            if (i > 0) seg.shift();  // Eliminar el punto duplicado en la juntura
            allPoints = allPoints.concat(seg);
        }

        return allPoints;
    }
};

if (typeof window !== 'undefined') {
    window.MaritimeRouter = MaritimeRouter;
}
