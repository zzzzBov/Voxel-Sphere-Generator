QueryString = (function (){
    return {
        parse: function (str) {
            var obj,
                vars,
                i,
                data,
                rawKey,
                rawValue,
                key,
                value;
            obj = {};
            str = str || location.search;
            if (!str) {
                return obj;
            }
            str = '' + str;
            if (str.charAt(0) === '?') {
                str = str.substr(1);
            }
            vars = str.split(/[&;]/);
            for (i = 0; i < vars.length; i++) {
                data = vars[i].split('=');
                rawKey = data.shift();
                rawValue = data.join('=');
                key = decodeURIComponent(rawKey)
                value = data.length ? decodeURIComponent(rawValue) : null;
                obj[key] = value;
            }
            return obj;
        },
        stringify: function (obj) {
            var i,
                key,
                value,
                safeKey,
                saveValue,
                arr;
            arr = [];
            for (key in obj) {
                value = obj[key];
                safeKey = encodeURIComponent(key);
                safeValue = encodeURIComponent(value);
                if (value === null) {
                    arr.push(safeKey);
                } else {
                    arr.push(safeKey + '=' + safeValue);
                }
            }
            return arr.join('&');
        }
    }
}());

(function (t) {
    var stage,
        scene,
        camera,
        renderer,
        controls,
        sphere,
        qs,
        data;

    function render() {
        requestAnimationFrame(render);

        controls.update();

        renderer.render(scene, camera);
    }

    function generateSphere(radius, eq) {
        var i,
            j,
            k,
            i2,
            j2,
            k2,
            r2,
            eq,
            red,
            green,
            blue,
            cube,
            sphere,
            geometry,
            material;

        radius = +radius;
        radius |= 0;
        if (radius < 1) {
            radius = 1;
        }
        if (radius > 50) {
            radius = 50;
        }

        sphere = new t.Object3D();

        geometry = new t.BoxGeometry(1, 1, 1);

        r2 = radius * radius;
        for (i = 0; i < radius + 1; i++) {
            i2 = i * i;

            red = (0xFF * (1 - i / radius)) << 16;

            for (j = 0; j < radius + 1; j++) {
                j2 = j * j;

                green = (0xFF * (1 - j / radius)) << 8;

                if (i2 + j2 > r2 || i2 + j2 === r2 && !eq) {
                    break;
                }

                for (k = 0; k < radius + 1; k++) {
                    k2 = k * k;

                    blue = (0xFF * (1 - k / radius)) << 0;

                    if (i2 + j2 + k2 > r2 || i2 + j2 + k2 === r2 && !eq) {
                        break;
                    }

                    material = new t.MeshBasicMaterial({
                        color: red | green | blue,
                        //wireframe: true
                    });

                    cube = new t.Mesh(geometry, material);
                    cube.translateX(i);
                    cube.translateY(j);
                    cube.translateZ(k);
                    sphere.add(cube);
                }
            }
        }
        return sphere;
    }

    function regenerateSphere() {
        var radius,
            eq,
            data,
            url;

        radius = $('#radius').val();
        eq = $('#eq').is(':checked');

        scene.remove(sphere);
        sphere = generateSphere(radius, eq);
        scene.add(sphere);

        data = {
            radius: radius,
        };
        if (eq) {
            data.eq = '1';
        }
        url = location.pathname + '?' + QueryString.stringify(data) + location.hash;
        history.pushState(data, null, url);
    }

    function popSphere(e) {
        var data;
        data = e.originalEvent.state || {};
        $('#radius').val(data.radius);
        $('#eq').prop('checked', data.eq);
        scene.remove(sphere);
        sphere = generateSphere(data.radius, data.eq);
        scene.add(sphere);
    }

    $('#radius').on('change', regenerateSphere);
    $('#eq').on('click', regenerateSphere);
    $(window).on('popstate', popSphere);

    stage = $('#stage').get(0);

    scene = new t.Scene();
    camera = new t.PerspectiveCamera(75, 1.3333333333333333, 0.1, 1000);

    controls = new t.TrackballControls(camera, stage);

    renderer = new t.WebGLRenderer({
        canvas: stage
    });

    qs = QueryString.parse();
    eq = Object.prototype.hasOwnProperty.call(qs, 'eq');
    $('#eq').prop('checked', eq);
    $('#radius').val(qs.radius);
    sphere = generateSphere(qs.radius, eq);

    data = {
        radius: qs.radius
    };
    if (eq) {
        data.eq = '1';
    }
    history.replaceState(data, null, location.pathname + location.search + location.hash)

    scene.add(sphere);

    camera.position.z = 50;

    render();

}(THREE));