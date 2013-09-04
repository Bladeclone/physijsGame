/**
 * 第一人称鼠标边界控制器
 * 实现功能，鼠标控制第一人称视角，在鼠标移到边界时移动视角
 * @author yanhaijing
 */

(function(g){
    "use strict";
    var
        T = g.THREE,
        BorderMouseFirstPersonControls = null;
    
    /**
     * 鼠标边界第一人称控制器对象
     * @class BorderMouseFirstPersonControls
     * @constructor
     * @param option {Object} 配置参数对象
     */    
    BorderMouseFirstPersonControls = function(option){
        
        this.option = this.extend({
            collision: true,//是否添加相机碰撞检测
            mouseDownMove: false,//是否添加默认鼠标点击前进后退事件
            borderWidth: 100,//默认数遍边界值为100
            collisionObject: [],//要检测的碰撞对象
            downable: true,//能否向下移动
            upable: true,//能否按键向上移动
            cameraWidth: 10,//摄像机的宽度，用来计算碰撞时摄像机与墙面建的距离
            movementSpeed: 1.0,//默认移动速度
            lookSpeed: 0.005,//默认视野切换速度
            lookVertical: true//是否能上下看
        }, option);
        
        this.object = this.option.camera;
        this.target = new THREE.Vector3( 0, 0, 0 );
    
        this.domElement = ( this.option.domElement !== undefined ) ? domElement : document;
    
        this.movementSpeed = this.option.movementSpeed;
        this.lookSpeed = this.option.lookSpeed;
    
        this.lookVertical = this.option.lookVertical;
        this.autoForward = false;
        // this.invertVertical = false;
    
        this.activeLook = true;
    
        this.heightSpeed = false;
        this.heightCoef = 1.0;
        this.heightMin = 0.0;
        this.heightMax = 1.0;
    
        this.constrainVertical = false;
        this.verticalMin = 0;
        this.verticalMax = Math.PI;
    
        this.autoSpeedFactor = 0.0;
    
        this.mouseX = 0;
        this.mouseY = 0;
    
        this.lat = 0;
        this.lon = 0;
        this.phi = 0;
        this.theta = 0;
    
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.freeze = false;
    
        this.mouseDragOn = false;
    
        this.viewHalfX = 0;
        this.viewHalfY = 0;
    
        if ( this.domElement !== document ) {
    
            this.domElement.setAttribute( 'tabindex', -1 );
    
        }
    
        //       
        
        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        
        if(this.option.mouseDownMove){
            this.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
            this.domElement.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
        }
        this.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        
                
        this.domElement.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
        this.domElement.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
    
    
        this.handleResize();
    };
    
    BorderMouseFirstPersonControls.prototype = {
        handleResize: function () {
    
            if ( this.domElement === document ) {
    
                this.viewHalfX = window.innerWidth / 2;
                this.viewHalfY = window.innerHeight / 2;
    
            } else {
    
                this.viewHalfX = this.domElement.offsetWidth / 2;
                this.viewHalfY = this.domElement.offsetHeight / 2;
    
            }
    
        },
    
        onMouseDown: function ( event ) {
    
            if ( this.domElement !== document ) {
    
                this.domElement.focus();
    
            }
     
            event.preventDefault();
            event.stopPropagation();
    
            if ( this.activeLook ) {
    
                switch ( event.button ) {
    
                    case 0: this.moveForward = true; break;
                    case 2: this.moveBackward = true; break;
    
                }
    
            }
    
            this.mouseDragOn = true;
    
        },
    
        onMouseUp: function ( event ) {
    
            event.preventDefault();
            event.stopPropagation();
    
            if ( this.activeLook ) {
    
                switch ( event.button ) {
    
                    case 0: this.moveForward = false; break;
                    case 2: this.moveBackward = false; break;
    
                }
    
            }
    
            this.mouseDragOn = false;
    
        },
    
        onMouseMove: function ( event ) {
    
            if ( this.domElement === document ) {
    
                this.mouseX = event.pageX - this.viewHalfX;
                this.mouseY = event.pageY - this.viewHalfY;
    
            } else {
    
                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
    
            }
    
        },
    
        onKeyDown: function ( event ) {
    
            //event.preventDefault();
    
            switch ( event.keyCode ) {
    
                case 38: /*up*/
                case 87: /*W*/ this.moveForward = true; break;
    
                case 37: /*left*/
                case 65: /*A*/ this.moveLeft = true; break;
    
                case 40: /*down*/
                case 83: /*S*/ this.moveBackward = true; break;
    
                case 39: /*right*/
                case 68: /*D*/ this.moveRight = true; break;
    
                case 82: /*R*/ this.moveUp = true; break;
                case 70: /*F*/ this.moveDown = true; break;
    
                case 81: /*Q*/ this.freeze = !this.freeze; break;
    
            }
    
        },
    
        onKeyUp: function ( event ) {
    
            switch( event.keyCode ) {
    
                case 38: /*up*/
                case 87: /*W*/ this.moveForward = false; break;
    
                case 37: /*left*/
                case 65: /*A*/ this.moveLeft = false; break;
    
                case 40: /*down*/
                case 83: /*S*/ this.moveBackward = false; break;
    
                case 39: /*right*/
                case 68: /*D*/ this.moveRight = false; break;
    
                case 82: /*R*/ this.moveUp = false; break;
                case 70: /*F*/ this.moveDown = false; break;
    
            }
    
        },
        
        update: function(delta){
            if ( this.freeze ) {

                return;
    
            }
    
            if ( this.heightSpeed ) {
    
                var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
                var heightDelta = y - this.heightMin;
    
                this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
    
            } else {
    
                this.autoSpeedFactor = 0.0;
    
            }
    
            var actualMoveSpeed = delta * this.movementSpeed;
    
            if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) {
                //判断似乎否开启碰撞检测
                if(this.option.collision === true){
                    var ray = new THREE.Raycaster();
                    ray.ray.direction.copy(this.target.clone().sub(this.object.position).normalize());
                    ray.ray.origin.copy( this.object.position );                
                    var intersections = ray.intersectObjects( this.option.collisionObject );
    
                    if ( intersections.length > 0 ) {
    
                        var distance = intersections[ 0 ].distance;
                        
                        if ( !(distance <= actualMoveSpeed + this.option.cameraWidth) ) {
                            this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                        }
    
                    }else{
                        this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                    }
                }else{
                    this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                }               
            }
            if ( this.moveBackward ) { 
                //判断似乎否开启碰撞检测
                if(this.option.collision === true){
                    var ray = new THREE.Raycaster();
                    ray.ray.direction.copy(this.object.position.clone().sub(this.target).normalize());
                    ray.ray.origin.copy( this.object.position );                
                    var intersections = ray.intersectObjects( this.option.collisionObject );
    
                    if ( intersections.length > 0 ) {
    
                        var distance = intersections[ 0 ].distance;
                        
                        if ( !(distance <= actualMoveSpeed + this.option.cameraWidth) ) {
                            this.object.translateZ( actualMoveSpeed );
                        }
    
                    }else{
                        this.object.translateZ( actualMoveSpeed );
                    }
                }else{
                    this.object.translateZ( actualMoveSpeed );
                }                                             
            }
    
            if ( this.moveLeft ) {
                //判断似乎否开启碰撞检测
                if(this.option.collision === true){
                    var ray = new THREE.Raycaster(),
                        temp = this.object.position.clone().sub(this.target).normalize(),
                        x = temp.x,
                        y = temp.y,
                        z = temp.z,
                        x1 = -1,
                        y1 = y,
                        z1 = -(x*x1 + y*y1)/z,
                        v = new g.THREE.Vector3(x1, y1, z1).normalize();
                    
                    ray.ray.direction.copy(v);
                    ray.ray.origin.copy( this.object.position );                
                    var intersections = ray.intersectObjects( this.option.collisionObject );
    
                    if ( intersections.length > 0 ) {
    
                        var distance = intersections[ 0 ].distance;
                        
                        if ( !(distance <= actualMoveSpeed + this.option.cameraWidth) ) {
                            this.object.translateX( - actualMoveSpeed );
                        }
    
                    }else{
                        this.object.translateX( - actualMoveSpeed );
                    }             
                }else{
                    this.object.translateX( - actualMoveSpeed );
                }
                   
            }
            if ( this.moveRight ) {
                //判断似乎否开启碰撞检测
                if(this.option.collision === true){
                    var ray = new THREE.Raycaster(),
                        temp = this.object.position.clone().sub(this.target).normalize(),
                        x = temp.x,
                        y = temp.y,
                        z = temp.z,
                        x1 = 1,
                        y1 = y,
                        z1 = -(x*x1 + y*y1)/z,
                        v = new g.THREE.Vector3(x1, y1, z1).normalize();
                    
                    ray.ray.direction.copy(v);
                    ray.ray.origin.copy( this.object.position );                
                    var intersections = ray.intersectObjects( this.option.collisionObject );
    
                    if ( intersections.length > 0 ) {
    
                        var distance = intersections[ 0 ].distance;
                        
                        if ( !(distance <= actualMoveSpeed + this.option.cameraWidth) ) {
                            this.object.translateX( actualMoveSpeed );
                        }
    
                    }else{
                        this.object.translateX( actualMoveSpeed );
                    }                                
                }else{
                    this.object.translateX( actualMoveSpeed );
                }
                
            }
    
            if (this.option.upable &&  this.moveUp) this.object.translateY( actualMoveSpeed );
            if (this.option.downable && this.moveDown) this.object.translateY( - actualMoveSpeed );
    
            var actualLookSpeed = delta * this.lookSpeed;
    
            if ( !this.activeLook ) {
    
                actualLookSpeed = 0;
    
            }
    
            var verticalLookRatio = 1;
    
            if ( this.constrainVertical ) {
    
                verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
    
            }
            
            if(this.mouseX < this.option.borderWidth - this.viewHalfX   || this.mouseX > this.viewHalfX - this.option.borderWidth){
                this.lon += this.mouseX * actualLookSpeed;
            }
            
            if( this.lookVertical && (this.mouseY < this.option.borderWidth - this.viewHalfY || this.mouseY > this.viewHalfY - this.option.borderWidth)) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
    
            this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
            this.phi = THREE.Math.degToRad( 90 - this.lat );
    
            this.theta = THREE.Math.degToRad( this.lon );
    
            if ( this.constrainVertical ) {
    
                this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
    
            }
    
            var targetPosition = this.target,
                position = this.object.position;
    
            targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
            targetPosition.y = position.y + 100 * Math.cos( this.phi );
            targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
    
            this.object.lookAt( targetPosition );
        },
        
        extend:function() {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;
        
            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }
        
            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
                target = {};
            }
        
            // extend jQuery itself if only one argument is passed
            if ( length === i ) {
                target = this;
                --i;
            }
        
            for ( ; i < length; i++ ) {
                // Only deal with non-null/undefined values
                if ( (options = arguments[ i ]) != null ) {
                    // Extend the base object
                    for ( name in options ) {
                        src = target[ name ];
                        copy = options[ name ];
        
                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }
        
                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : [];
        
                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }
        
                            // Never move original objects, clone them
                            target[ name ] = jQuery.extend( deep, clone, copy );
        
                        // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }
        
            // Return the modified object
            return target;
        },
        
        setCollision:function(collision){
            return typeof collision === 'boolean' ? this.option.collision = collision : this.option.collision;
        },
        isCollision:function(){
            return this.option.collision;
        }
    };
        
    T.BorderMouseFirstPersonControls = T.BorderMouseFirstPersonControls || BorderMouseFirstPersonControls;
}(window));
