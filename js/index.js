/**
 * @author yanhaijing
 */

(function($, g){
    "use strict";
    var
        Game;
        
    Game = function(){
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.width = 0;
        this.height = 0;
        this.body = null;
        this.direction = 0;//为零不运动
    };
    
    Game.prototype = {
        init:function(container){
            this.initPhysijs();
            this.initRenderer(container);           
            this.initScene();
            this.initCamera();
            this.initLight();
            this.initShapes();
            this.initGround();
            
            this.initBody();
            
            this.bindEvent();
            var self = this;
            
            var render = function() {
                requestAnimationFrame( render );
                self.scene.simulate();
                self.renderer.render( self.scene, self.camera );
            };
            requestAnimationFrame( render );
            self.scene.simulate();
        },
        
        initPhysijs:function(){
            g.Physijs.scripts.worker = 'plugin/physijs/physijs_worker.js';
            g.Physijs.scripts.ammo = 'ammo.js';
        },
        /**
         * 初始化渲染器
         * @method initRenderer
         * @param {dom} container 渲染器要添加到的dom元素，若不穿如则默认为body元素
         */
        initRenderer:function(container){
            var
                renderer = new THREE.WebGLRenderer({ antialias: true }),
                container = container || document.getElementsByTagName("body")[0],
                width = container.clientWidth,
                height = container.clientHeight;
                
            renderer.setSize( width, height );
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;
            container.appendChild( renderer.domElement );
            
            this.width = width;
            this.height =height;
            this.renderer = renderer;
        },
        
        initScene:function(){
            var
                scene = new Physijs.Scene,
                self = this;
            scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
            scene.addEventListener(
                'update',
                function() {
                    var
                        body = self.body,
                        camera = self.camera;
                    //g.console.log(self.direction);
                    switch (self.direction) {
                        case 1: // left
                            //body.position.x += 0.2;
                            body.applyCentralImpulse( new THREE.Vector3( 10, 0, 0 ) );
                            camera.position.copy({
                                x: body.position.x - 15,
                                y: body.position.y + 2.5,
                                z: body.position.z
                            });
                            camera.lookAt({
                                x: body.position.x + 1,
                                y: body.position.y,
                                z: body.position.z
                            });
                            g.console.log(body.position.x);
                            break;

                        case 2: // forward
                            camera.position.copy({
                                x: body.position.x,
                                y: body.position.y + 2.5,
                                z: body.position.z - 15
                            });
                            camera.lookAt({
                                x: body.position.x,
                                y: body.position.y,
                                z: body.position.z + 1
                            });
                            //body.position.z += 0.2;
                            body.applyCentralImpulse( new THREE.Vector3( 0, 0, -0.2 ) );
                            break;

                        case 3: // right
                            camera.position.copy({
                                x: body.position.x + 15,
                                y: body.position.y + 2.5,
                                z: body.position.z
                            });
                            camera.lookAt({
                                x: body.position.x - 1,
                                y: body.position.y,
                                z: body.position.z
                            });
                            //body.position.x -= 0.2;
                            body.applyCentralImpulse( new THREE.Vector3( -0.2, 0, 0 ) );
                            break;
                        case 4: // back
                            camera.position.copy({
                                x: body.position.x,
                                y: body.position.y + 2.5,
                                z: body.position.z + 15
                            });
                            camera.lookAt({
                                x: body.position.x,
                                y: body.position.y,
                                z: body.position.z - 1
                            });
                            //body.position.z -= 0.2;
                            body.applyCentralImpulse( new THREE.Vector3( 0, 0, -0.2 ) );
                            break;
                    }
                    camera.position.copy({
                        x: 10,
                        y:80,
                        z:10
                    });
                    camera.lookAt({
                        x:0,
                        y:0,
                        z:0
                    });
                    //body.__dirtyPosition = true;
                    scene.simulate( undefined, 2 );
                }
            );
            
            this.scene = scene;
        },
        
        initCamera:function(){
            var
                camera = new THREE.PerspectiveCamera(
                    35,
                    this.width / this.height,
                    1,
                    1000
                );
            
            camera.position.set(10, 150, 10);
            camera.lookAt(this.scene.position);
            this.camera = camera;
            this.scene.add(camera);            
        },
        initLight:function(){
            // Light
            var
                light = new THREE.DirectionalLight( 0xFFFFFF );
            light.position.set( 20, 40, -15 );
            light.target.position.copy( this.scene.position );
            light.castShadow = true;
            light.shadowCameraLeft = -60;
            light.shadowCameraTop = -60;
            light.shadowCameraRight = 60;
            light.shadowCameraBottom = 60;
            light.shadowCameraNear = 20;
            light.shadowCameraFar = 200;
            light.shadowBias = -.0001
            light.shadowMapWidth = light.shadowMapHeight = 2048;
            light.shadowDarkness = .7;
            this.scene.add( light );
        },
        initGround:function(){
            var
                ground_material = Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'img/rocks.jpg' ) }),
                    .8, // high friction
                    .4 // low restitution
                ),
                ground;
            ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
            ground_material.map.repeat.set( 3, 3 );
            
            ground = new Physijs.BoxMesh(new THREE.CubeGeometry(100, 1, 100), ground_material, 0);
            ground.position.y = -0.5;
            this.scene.add(ground);
        },
        initShapes:function(){
            var
                box = null,
                box_material = new Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('img/plywood.jpg')}),
                    1.0, // low friction
                    0.9 // high restitution
                ),
                box_geometry = new THREE.CubeGeometry( 5, 5, 5 ),
                i = 0,
                j = 0,
                len = 10;                   
            box_material.map.wrapS = THREE.RepeatWrapping;
            box_material.map.repeat.set( .25, .25 );
            for(i = 0; i < len; i = i + 1){
                for(j = 0; j < len; j = j + 1){
                    box = new Physijs.BoxMesh(
                        box_geometry,
                        box_material,
                        0
                    );
                    
                    box.position.set(-50 + 2.5 + i * 10, 2.5, -50 + 2.5 + j * 10);
                    this.scene.add(box);
                }
            }                       
        },
        
        initBody:function(){
             var
                box = null,
                box_material = new Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('img/plywood.jpg')}),
                    0.5, // low friction
                    0.9 // high restitution
                ),
                box_geometry = new THREE.CubeGeometry( 4, 6, 4 );
            box_material.map.wrapS = THREE.RepeatWrapping;
            box_material.map.repeat.set( .25, .25 );    
            box = new Physijs.BoxMesh(
                box_geometry,
                box_material
            );
            
            box.position.set(-2.5, 2.5, -2.5);
            
            this.body = box;
            this.scene.add(box);          
        },
        
        bindEvent:function(){
            var
                bindKeyEvent = null,
                self = this;
                
            bindKeyEvent = function(){
                document.addEventListener('keydown', function( ev ) {
                    switch ( ev.keyCode ) {
                        case 37: // left
                            self.direction = 1;
                            break;

                        case 38: // forward
                            self.direction = 2;
                            break;

                        case 39: // right
                            self.direction = 3;
                            break;

                        case 40: // back
                            self.direction = 4;
                            break;
                    }
                });
                document.addEventListener('keyup', function( ev ) {
                    switch ( ev.keyCode ) {
                        case 37: // left
                            self.direction = 0;
                            break;

                        case 38: // forward
                            self.direction = 0;
                            break;

                        case 39: // right
                            self.direction = 0;
                            break;

                        case 40: // back
                            self.direction = 0;
                            break;
                    }
                });
            };
            
            bindKeyEvent();
        }       
    };
    
    
    $(function(){
        var
            game = new Game();
            
        game.init($('#screen').get(0));
    });
}(jQuery, window));
