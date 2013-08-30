/**
 * @author yanhaijing
 */

(function($, g){
    "use strict";
    var
        T = g.THREE,
        myFirstPersonControls = null,
        p = g.physijsGame = g.physijsGame || {};
        
    myFirstPersonControls = function(object, domElement, obj){
        T.FirstPersonControls.call(this, object, domElement);
        
        this.update = function(delta){
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
                var ray = new THREE.Raycaster();
                ray.ray.direction.copy(this.target.clone().sub(this.object.position).normalize());
                ray.ray.origin.copy( this.object.position );                
                var intersections = ray.intersectObjects( obj );

                if ( intersections.length > 0 ) {

                    var distance = intersections[ 0 ].distance;
                    
                    if ( !(distance <= actualMoveSpeed) ) {
                        g.console.log(distance);
                        this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                    }

                }else{
                    this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                }
            }
            if ( this.moveBackward ) {               
                var ray = new THREE.Raycaster();
                ray.ray.direction.copy(this.object.position.clone().sub(this.target).normalize());
                ray.ray.origin.copy( this.object.position );                
                var intersections = ray.intersectObjects( obj );

                if ( intersections.length > 0 ) {

                    var distance = intersections[ 0 ].distance;
                    
                    if ( !(distance <= actualMoveSpeed) ) {
                        g.console.log(distance);
                        this.object.translateZ( actualMoveSpeed );
                    }

                }else{
                    this.object.translateZ( actualMoveSpeed );
                }
            }
    
            if ( this.moveLeft ) {
                var ray = new THREE.Raycaster(),
                    temp = this.object.position.clone().sub(this.target).normalize(),
                    x = temp.x,
                    y = temp.y,
                    z = temp.z,
                    x1 = 1,
                    y1 = y,
                    z1 = -(x + y*y1)/z,
                    v = new g.THREE.Vector3(x1, y1, z1).normalize();
                
                ray.ray.direction.copy(v);
                ray.ray.origin.copy( this.object.position );                
                var intersections = ray.intersectObjects( obj );

                if ( intersections.length > 0 ) {

                    var distance = intersections[ 0 ].distance;
                    
                    if ( !(distance <= actualMoveSpeed) ) {
                        g.console.log(distance);
                        this.object.translateX( - actualMoveSpeed );
                    }

                }else{
                    this.object.translateX( - actualMoveSpeed );
                }                
            }
            if ( this.moveRight ) {
                var ray = new THREE.Raycaster(),
                    temp = this.object.position.clone().sub(this.target).normalize(),
                    x = temp.x,
                    y = temp.y,
                    z = temp.z,
                    x1 = -1,
                    y1 = y,
                    z1 = -(x + y*y1)/z,
                    v = new g.THREE.Vector3(x1, y1, z1).normalize();
                
                ray.ray.direction.copy(v);
                ray.ray.origin.copy( this.object.position );                
                var intersections = ray.intersectObjects( obj );

                if ( intersections.length > 0 ) {

                    var distance = intersections[ 0 ].distance;
                    
                    if ( !(distance <= actualMoveSpeed) ) {
                        g.console.log(distance);
                        this.object.translateX( actualMoveSpeed );
                    }

                }else{
                    this.object.translateX( actualMoveSpeed );
                }                                
            }
    
            if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
            if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );
    
            var actualLookSpeed = delta * this.lookSpeed;
    
            if ( !this.activeLook ) {
    
                actualLookSpeed = 0;
    
            }
    
            var verticalLookRatio = 1;
    
            if ( this.constrainVertical ) {
    
                verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
    
            }
    
            this.lon += this.mouseX * actualLookSpeed;
            if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
    
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
            //console.log(this.mouseX,this.mouseY);
        };
    };
    
    p.myFirstPersonControls = myFirstPersonControls;
}(jQuery, window));
