/**
 * MaritimeRouter
 * Enrutador marítimo basado en una red de corredores oceánicos.
 * Evita trazos extraños de gran círculo entre continentes usando:
 * - nodos marítimos predefinidos
 * - búsqueda del mejor camino (Dijkstra)
 * - puntos de aproximación costera para puertos/ciudades costeras
 *
 * Dependencia: GeoUtils.calculateDistance
 */
const MaritimeRouter = {

    NODE_DEFS: {
        PAC_N_EAST:      { lat: 27.0,  lng: -128.0 },
        PAC_N_MID:       { lat: 29.0,  lng: -155.0 },
        PAC_N_WEST:      { lat: 32.0,  lng: 160.0 },
        TOKYO_APPROACH:  { lat: 34.8,  lng: 141.5 },

        PANAMA_PAC:      { lat: 7.7,   lng: -79.55 },
        PANAMA_CAR:      { lat: 9.3,   lng: -79.9 },
        CENTAM_PAC_OFF:  { lat: 8.8,   lng: -89.2 },
        COSTA_RICA_PAC:  { lat: 8.9,   lng: -84.9 },
        CHIRIQUI_PAC:    { lat: 7.9,   lng: -82.6 },
        AZUERO_PAC:      { lat: 7.3,   lng: -80.75 },
        CANAL_PAC:       { lat: 8.35,  lng: -79.62 },
        CANAL_MID:       { lat: 8.9,   lng: -79.70 },
        CANAL_CAR:       { lat: 9.28,  lng: -79.88 },
        CARIBBEAN_W:     { lat: 15.5,  lng: -81.5 },
        CARTAGENA_OFF:   { lat: 10.9,  lng: -76.2 },
        YUCATAN:         { lat: 21.8,  lng: -86.8 },
        GULF_CENTRAL:    { lat: 22.8,  lng: -92.5 },
        VERACRUZ_OFF:    { lat: 19.8,  lng: -96.3 },

        ATL_N_WEST:      { lat: 25.0,  lng: -60.0 },
        ATL_N_MID:       { lat: 25.0,  lng: -35.0 },
        GIBRALTAR:       { lat: 35.9,  lng: -5.6 },
        PORTUGAL_SW_OFF: { lat: 37.0,  lng: -9.8 },
        LISBON_OFF:      { lat: 38.6,  lng: -9.7 },
        MADEIRA_OFF:     { lat: 32.6,  lng: -17.4 },
        IBERIA_W_OFF:    { lat: 38.9,  lng: -12.6 },
        PORTO_OFF:       { lat: 41.4,  lng: -9.7 },
        GALICIA_OFF:     { lat: 43.1,  lng: -9.4 },
        CANTABRIAN_W:    { lat: 43.9,  lng: -7.0 },
        BISCAY_OFF:      { lat: 45.5,  lng: -9.2 },
        SANTANDER_OFF:   { lat: 43.7,  lng: -4.5 },
        CHANNEL_W:       { lat: 49.2,  lng: -6.3 },
        SOUTHAMPTON_OFF: { lat: 50.6,  lng: -2.1 },
        SOLENT_W:        { lat: 50.65, lng: -1.65 },

        MED_WEST:        { lat: 38.0,  lng: 0.5 },
        MED_CENTRAL:     { lat: 38.5,  lng: 10.0 },
        VALENCIA_OFF:    { lat: 39.2,  lng: -0.2 },
        CARTAGENA_ES_OFF:{ lat: 37.4,  lng: -0.7 },
        ALBORAN_EAST:    { lat: 36.3,  lng: -2.2 },
        MALAGA_OFF:      { lat: 36.2,  lng: -4.8 },
        BARCELONA_OFF:   { lat: 41.2,  lng: 2.45 },
        GENOA_OFF:       { lat: 44.2,  lng: 9.2 },

        SUEZ_MED:        { lat: 31.2,  lng: 32.4 },
        SUEZ_RED:        { lat: 27.5,  lng: 34.1 },
        RED_SEA_S:       { lat: 18.0,  lng: 40.0 },

        IND_WEST:        { lat: 2.0,   lng: 60.0 },
        IND_EAST:        { lat: 4.0,   lng: 88.0 },
        MALACCA:         { lat: 2.0,   lng: 103.5 },

        PAC_S_EAST:      { lat: -10.0, lng: -95.0 },
        PAC_S_MID:       { lat: -18.0, lng: -130.0 },
        PAC_S_WEST:      { lat: -15.0, lng: 150.0 },
        CALLAO_OFF:      { lat: -12.5, lng: -78.8 },
        VALPARAISO_OFF:  { lat: -33.4, lng: -72.3 },

        CAPE_HORN_PAC:   { lat: -50.0, lng: -75.5 },
        CAPE_HORN_ATL:   { lat: -57.5, lng: -58.5 },
        ATL_S_WEST:      { lat: -30.0, lng: -40.0 },
        ATL_S_EAST:      { lat: -30.0, lng: -10.0 },
        GOOD_HOPE:       { lat: -36.5, lng: 17.5 },
        BUENOS_AIRES_OFF:{ lat: -35.2, lng: -56.2 },
        SANTOS_OFF:      { lat: -24.4, lng: -45.7 }
    },

    EDGE_DEFS: [
        ['PAC_N_EAST', 'PAC_N_MID'],
        ['PAC_N_MID', 'PAC_N_WEST'],
        ['PAC_N_WEST', 'TOKYO_APPROACH'],
        ['PAC_N_EAST', 'CENTAM_PAC_OFF'],

        ['CENTAM_PAC_OFF', 'COSTA_RICA_PAC'],
        ['COSTA_RICA_PAC', 'CHIRIQUI_PAC'],
        ['CHIRIQUI_PAC', 'AZUERO_PAC'],
        ['AZUERO_PAC', 'PANAMA_PAC'],
        ['PANAMA_PAC', 'CANAL_PAC'],
        ['CANAL_PAC', 'CANAL_MID'],
        ['CANAL_MID', 'CANAL_CAR'],
        ['CANAL_CAR', 'PANAMA_CAR'],
        ['PANAMA_CAR', 'CARIBBEAN_W'],
        ['PANAMA_CAR', 'CARTAGENA_OFF'],
        ['CARIBBEAN_W', 'YUCATAN'],
        ['CARIBBEAN_W', 'CARTAGENA_OFF'],
        ['YUCATAN', 'GULF_CENTRAL'],
        ['GULF_CENTRAL', 'VERACRUZ_OFF'],
        ['ATL_N_WEST', 'CARTAGENA_OFF'],
        ['CARIBBEAN_W', 'ATL_N_WEST'],
        ['GULF_CENTRAL', 'ATL_N_WEST'],
        ['ATL_N_WEST', 'ATL_N_MID'],
        ['ATL_N_MID', 'GIBRALTAR'],
        ['GIBRALTAR', 'PORTUGAL_SW_OFF'],
        ['PORTUGAL_SW_OFF', 'LISBON_OFF'],
        ['PORTUGAL_SW_OFF', 'MADEIRA_OFF'],
        ['LISBON_OFF', 'PORTO_OFF'],
        ['PORTO_OFF', 'GALICIA_OFF'],
        ['GALICIA_OFF', 'CANTABRIAN_W'],
        ['CANTABRIAN_W', 'SANTANDER_OFF'],
        ['IBERIA_W_OFF', 'PORTO_OFF'],
        ['IBERIA_W_OFF', 'GALICIA_OFF'],
        ['ATL_N_MID', 'IBERIA_W_OFF'],
        ['GIBRALTAR', 'IBERIA_W_OFF'],
        ['IBERIA_W_OFF', 'BISCAY_OFF'],
        ['BISCAY_OFF', 'CANTABRIAN_W'],
        ['BISCAY_OFF', 'CHANNEL_W'],
        ['CHANNEL_W', 'SOUTHAMPTON_OFF'],
        ['CHANNEL_W', 'SOLENT_W'],
        ['SOLENT_W', 'SOUTHAMPTON_OFF'],

        ['MED_WEST', 'MED_CENTRAL'],
        ['MED_WEST', 'VALENCIA_OFF'],
        ['VALENCIA_OFF', 'BARCELONA_OFF'],
        ['VALENCIA_OFF', 'CARTAGENA_ES_OFF'],
        ['CARTAGENA_ES_OFF', 'ALBORAN_EAST'],
        ['MED_WEST', 'ALBORAN_EAST'],
        ['ALBORAN_EAST', 'MALAGA_OFF'],
        ['MALAGA_OFF', 'GIBRALTAR'],
        ['MED_CENTRAL', 'GENOA_OFF'],
        ['MED_CENTRAL', 'SUEZ_MED'],

        ['SUEZ_MED', 'SUEZ_RED'],
        ['SUEZ_RED', 'RED_SEA_S'],
        ['RED_SEA_S', 'IND_WEST'],
        ['IND_WEST', 'IND_EAST'],
        ['IND_EAST', 'MALACCA'],
        ['MALACCA', 'PAC_S_WEST'],
        ['MALACCA', 'PAC_N_WEST'],

        ['PAC_S_EAST', 'PAC_S_MID'],
        ['PAC_S_MID', 'PAC_S_WEST'],
        ['PAC_S_EAST', 'CENTAM_PAC_OFF'],
        ['PAC_S_EAST', 'CALLAO_OFF'],
        ['PAC_S_EAST', 'VALPARAISO_OFF'],
        ['CALLAO_OFF', 'VALPARAISO_OFF'],
        ['PAC_S_EAST', 'CAPE_HORN_PAC'],
        ['VALPARAISO_OFF', 'CAPE_HORN_PAC'],

        ['CAPE_HORN_PAC', 'CAPE_HORN_ATL'],
        ['CAPE_HORN_ATL', 'ATL_S_WEST'],
        ['ATL_S_WEST', 'ATL_S_EAST'],
        ['ATL_S_EAST', 'GOOD_HOPE'],
        ['ATL_S_WEST', 'BUENOS_AIRES_OFF'],
        ['ATL_S_WEST', 'SANTOS_OFF'],
        ['ATL_S_WEST', 'ATL_N_WEST'],
        ['ATL_S_EAST', 'ATL_N_MID'],
        ['GOOD_HOPE', 'IND_WEST']
    ],

    COASTAL_APPROACHES: [
        { target: { lat: 19.2006, lng: -96.1429 }, approachNode: 'VERACRUZ_OFF', thresholdKm: 220 },
        { target: { lat: 10.3910, lng: -75.4794 }, approachNode: 'CARTAGENA_OFF', thresholdKm: 220 },
        { target: { lat: -12.0464, lng: -77.1428 }, approachNode: 'CALLAO_OFF', thresholdKm: 180 },
        { target: { lat: -33.0458, lng: -71.6197 }, approachNode: 'VALPARAISO_OFF', thresholdKm: 220 },
        { target: { lat: 41.3851, lng: 2.1734 },    approachNode: 'BARCELONA_OFF', thresholdKm: 120 },
        { target: { lat: 36.7213, lng: -4.4214 },   approachNode: 'MALAGA_OFF', thresholdKm: 160 },
        { target: { lat: 43.4623, lng: -3.8100 },   approachNode: 'SANTANDER_OFF', thresholdKm: 180 },
        { target: { lat: 44.4056, lng: 8.9463 },    approachNode: 'GENOA_OFF', thresholdKm: 120 },
        { target: { lat: 38.7223, lng: -9.1393 },   approachNode: 'LISBON_OFF', thresholdKm: 220 },
        { target: { lat: 32.6669, lng: -16.9241 },  approachNode: 'MADEIRA_OFF', thresholdKm: 180 },
        { target: { lat: -34.6037, lng: -58.3816 }, approachNode: 'BUENOS_AIRES_OFF', thresholdKm: 250 },
        { target: { lat: -23.9608, lng: -46.3339 }, approachNode: 'SANTOS_OFF', thresholdKm: 180 },
        { target: { lat: 50.9097, lng: -1.4044 },   approachNode: 'SOLENT_W', thresholdKm: 250 },
        { target: { lat: 35.6167, lng: 139.7667 },  approachNode: 'TOKYO_APPROACH', thresholdKm: 220 }
    ],

    REGION_NODE_CANDIDATES: {
        PAC_N: ['PAC_N_EAST', 'PAC_N_MID', 'PAC_N_WEST', 'CENTAM_PAC_OFF', 'COSTA_RICA_PAC', 'PANAMA_PAC', 'TOKYO_APPROACH'],
        PAC_S: ['PAC_S_EAST', 'PAC_S_MID', 'PAC_S_WEST', 'CENTAM_PAC_OFF', 'COSTA_RICA_PAC', 'PANAMA_PAC', 'CAPE_HORN_PAC', 'CALLAO_OFF', 'VALPARAISO_OFF'],
        ATL_N: ['PANAMA_CAR', 'CARIBBEAN_W', 'CARTAGENA_OFF', 'YUCATAN', 'GULF_CENTRAL', 'VERACRUZ_OFF', 'ATL_N_WEST', 'ATL_N_MID', 'GIBRALTAR', 'PORTUGAL_SW_OFF', 'LISBON_OFF', 'MADEIRA_OFF', 'IBERIA_W_OFF', 'PORTO_OFF', 'GALICIA_OFF', 'CANTABRIAN_W', 'BISCAY_OFF', 'SANTANDER_OFF', 'CHANNEL_W', 'SOLENT_W', 'SOUTHAMPTON_OFF'],
        ATL_S: ['ATL_S_WEST', 'ATL_S_EAST', 'CAPE_HORN_ATL', 'GOOD_HOPE', 'BUENOS_AIRES_OFF', 'SANTOS_OFF'],
        MED: ['GIBRALTAR', 'MED_WEST', 'MED_CENTRAL', 'VALENCIA_OFF', 'CARTAGENA_ES_OFF', 'ALBORAN_EAST', 'MALAGA_OFF', 'BARCELONA_OFF', 'GENOA_OFF', 'SUEZ_MED'],
        RED_SEA: ['SUEZ_RED', 'RED_SEA_S'],
        IND: ['GOOD_HOPE', 'IND_WEST', 'IND_EAST', 'MALACCA', 'SUEZ_RED'],
        OPEN: []
    },

    getRegion: function(lat, lng) {
        if (this.isMediterranean(lat, lng)) return 'MED';
        if (this.isRedSea(lat, lng)) return 'RED_SEA';
        if (this.isGulfOfMexico(lat, lng) || this.isCaribbean(lat, lng) || this.isAtlanticNorth(lat, lng)) return 'ATL_N';
        if (this.isAtlanticSouth(lat, lng)) return 'ATL_S';
        if (this.isIndianOcean(lat, lng)) return 'IND';
        if (this.isPacificNorth(lat, lng)) return 'PAC_N';
        if (this.isPacificSouth(lat, lng)) return 'PAC_S';
        return 'OPEN';
    },

    isMediterranean: function(lat, lng) {
        return lat > 29 && lat < 48 && lng > -6 && lng < 42;
    },

    isRedSea: function(lat, lng) {
        return lat > 12 && lat < 30 && lng > 32 && lng < 44;
    },

    isGulfOfMexico: function(lat, lng) {
        return lat >= 18 && lat <= 31 && lng <= -82 && lng >= -98;
    },

    isCaribbean: function(lat, lng) {
        return lat >= 9 && lat <= 24 && lng >= -89 && lng <= -60;
    },

    isAtlanticNorth: function(lat, lng) {
        return lat >= 10 && lat < 70 && lng > -80 && lng < -5;
    },

    isAtlanticSouth: function(lat, lng) {
        return lat < 10 && lat > -58 && lng > -62 && lng < 25;
    },

    isIndianOcean: function(lat, lng) {
        return lat > -42 && lat < 32 && lng > 20 && lng < 130;
    },

    isPacificNorth: function(lat, lng) {
        return lat >= 0 && lat < 72 && (lng < -84 || lng > 130);
    },

    isPacificSouth: function(lat, lng) {
        return lat < 0 && (lng < -70 || lng > 128);
    },

    getNode: function(nodeId) {
        return this.NODE_DEFS[nodeId];
    },

    getAllNodeIds: function() {
        return Object.keys(this.NODE_DEFS);
    },

    getEdgeWeight: function(aId, bId) {
        var a = this.getNode(aId);
        var b = this.getNode(bId);
        return GeoUtils.calculateDistance(a.lat, a.lng, b.lat, b.lng);
    },

    getEndpointConnectionCost: function(lat, lng, nodeId) {
        var node = this.getNode(nodeId);
        var distance = GeoUtils.calculateDistance(lat, lng, node.lat, node.lng);

        if (nodeId === 'PANAMA_PAC' && distance > 500) {
            return distance + 900;
        }

        return distance;
    },

    getAdjacency: function() {
        if (this._adjacency) return this._adjacency;

        var adjacency = {};
        this.getAllNodeIds().forEach(function(id) {
            adjacency[id] = [];
        });

        for (var i = 0; i < this.EDGE_DEFS.length; i++) {
            var edge = this.EDGE_DEFS[i];
            var from = edge[0];
            var to = edge[1];
            var weight = this.getEdgeWeight(from, to);
            adjacency[from].push({ to: to, weight: weight });
            adjacency[to].push({ to: from, weight: weight });
        }

        this._adjacency = adjacency;
        return adjacency;
    },

    getNearestApproachNode: function(lat, lng) {
        var best = null;

        for (var i = 0; i < this.COASTAL_APPROACHES.length; i++) {
            var entry = this.COASTAL_APPROACHES[i];
            var distance = GeoUtils.calculateDistance(lat, lng, entry.target.lat, entry.target.lng);
            if (distance <= entry.thresholdKm && (!best || distance < best.distance)) {
                best = { nodeId: entry.approachNode, distance: distance };
            }
        }

        return best ? best.nodeId : null;
    },

    rankNodesByDistance: function(lat, lng, nodeIds, maxCount) {
        return nodeIds
            .map(function(nodeId) {
                var node = MaritimeRouter.getNode(nodeId);
                return {
                    nodeId: nodeId,
                    distance: GeoUtils.calculateDistance(lat, lng, node.lat, node.lng)
                };
            })
            .sort(function(a, b) { return a.distance - b.distance; })
            .slice(0, maxCount || nodeIds.length)
            .map(function(entry) { return entry.nodeId; });
    },

    getCandidateNodes: function(lat, lng) {
        var approachNode = this.getNearestApproachNode(lat, lng);
        var region = this.getRegion(lat, lng);
        var candidates = (this.REGION_NODE_CANDIDATES[region] || []).slice();

        if (approachNode && candidates.indexOf(approachNode) === -1) {
            candidates.unshift(approachNode);
        }

        if (this.isGulfOfMexico(lat, lng)) {
            candidates = ['VERACRUZ_OFF', 'GULF_CENTRAL', 'YUCATAN', 'CARIBBEAN_W', 'ATL_N_WEST']
                .filter(function(id, index, list) { return list.indexOf(id) === index; })
                .concat(candidates.filter(function(id) {
                    return ['VERACRUZ_OFF', 'GULF_CENTRAL', 'YUCATAN', 'CARIBBEAN_W', 'ATL_N_WEST'].indexOf(id) === -1;
                }));
        } else if (this.isCaribbean(lat, lng)) {
            candidates = ['CARTAGENA_OFF', 'PANAMA_CAR', 'CARIBBEAN_W', 'YUCATAN', 'ATL_N_WEST']
                .concat(candidates)
                .filter(function(id, index, list) { return list.indexOf(id) === index; });
        }

        if (candidates.length === 0) {
            candidates = this.rankNodesByDistance(lat, lng, this.getAllNodeIds(), 4);
        }

        return this.rankNodesByDistance(lat, lng, candidates, 4);
    },

    findShortestPath: function(startId, endId) {
        if (startId === endId) return [startId];

        var adjacency = this.getAdjacency();
        var nodeIds = this.getAllNodeIds();
        var distances = {};
        var previous = {};
        var unvisited = {};

        nodeIds.forEach(function(id) {
            distances[id] = Infinity;
            previous[id] = null;
            unvisited[id] = true;
        });

        distances[startId] = 0;

        while (true) {
            var current = null;
            var currentDistance = Infinity;

            nodeIds.forEach(function(id) {
                if (unvisited[id] && distances[id] < currentDistance) {
                    current = id;
                    currentDistance = distances[id];
                }
            });

            if (!current) return null;
            if (current === endId) break;

            delete unvisited[current];

            var neighbors = adjacency[current] || [];
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (!unvisited[neighbor.to]) continue;

                var tentative = distances[current] + neighbor.weight;
                if (tentative < distances[neighbor.to]) {
                    distances[neighbor.to] = tentative;
                    previous[neighbor.to] = current;
                }
            }
        }

        var path = [];
        var cursor = endId;
        while (cursor) {
            path.unshift(cursor);
            cursor = previous[cursor];
        }

        return path.length && path[0] === startId ? path : null;
    },

    estimateRouteCost: function(lat1, lng1, startId, endId, lat2, lng2) {
        var path = this.findShortestPath(startId, endId);
        if (!path) return null;

        var cost = this.getEndpointConnectionCost(lat1, lng1, startId) +
            this.getEndpointConnectionCost(lat2, lng2, endId);

        for (var i = 0; i < path.length - 1; i++) {
            cost += this.getEdgeWeight(path[i], path[i + 1]);
        }

        return { path: path, cost: cost };
    },

    getBestNodePath: function(lat1, lng1, lat2, lng2) {
        var startApproach = this.getNearestApproachNode(lat1, lng1);
        var endApproach = this.getNearestApproachNode(lat2, lng2);
        var startCandidates = startApproach ? [startApproach] : this.getCandidateNodes(lat1, lng1);
        var endCandidates = endApproach ? [endApproach] : this.getCandidateNodes(lat2, lng2);
        var best = null;

        for (var i = 0; i < startCandidates.length; i++) {
            for (var j = 0; j < endCandidates.length; j++) {
                var estimate = this.estimateRouteCost(
                    lat1, lng1,
                    startCandidates[i],
                    endCandidates[j],
                    lat2, lng2
                );

                if (estimate && (!best || estimate.cost < best.cost)) {
                    best = estimate;
                }
            }
        }

        return best ? best.path : null;
    },

    normalizeLng: function(lng) {
        var normalized = lng;
        while (normalized > 180) normalized -= 360;
        while (normalized < -180) normalized += 360;
        return normalized;
    },

    interpolateLinearSegment: function(pointA, pointB, numPoints) {
        var points = [];
        var steps = numPoints || 16;
        var deltaLng = this.normalizeLng(pointB.lng - pointA.lng);

        for (var i = 0; i <= steps; i++) {
            var factor = i / steps;
            points.push({
                lat: pointA.lat + ((pointB.lat - pointA.lat) * factor),
                lng: this.normalizeLng(pointA.lng + (deltaLng * factor))
            });
        }

        return points;
    },

    buildRouteFromPoints: function(points) {
        var route = [];

        for (var i = 0; i < points.length - 1; i++) {
            var distance = GeoUtils.calculateDistance(
                points[i].lat, points[i].lng,
                points[i + 1].lat, points[i + 1].lng
            );
            var steps = Math.max(8, Math.min(28, Math.round(distance / 180)));
            var segment = this.interpolateLinearSegment(points[i], points[i + 1], steps);
            if (i > 0) segment.shift();
            route = route.concat(segment);
        }

        return route;
    },

    computeRoute: function(lat1, lng1, lat2, lng2) {
        var start = { lat: lat1, lng: lng1 };
        var end = { lat: lat2, lng: lng2 };
        var nodePath = this.getBestNodePath(lat1, lng1, lat2, lng2);

        if (!nodePath || nodePath.length === 0) {
            return this.buildRouteFromPoints([start, end]);
        }

        var keypoints = [start];
        for (var i = 0; i < nodePath.length; i++) {
            keypoints.push(this.getNode(nodePath[i]));
        }
        keypoints.push(end);

        return this.buildRouteFromPoints(keypoints);
    }
};

if (typeof window !== 'undefined') {
    window.MaritimeRouter = MaritimeRouter;
}
