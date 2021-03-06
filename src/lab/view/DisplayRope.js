// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.lab.view.DisplayRope');

goog.require('goog.asserts');
goog.require('myphysicslab.lab.engine2D.Rope');
goog.require('myphysicslab.lab.model.SimObject');
goog.require('myphysicslab.lab.util.AffineTransform');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayObject');

goog.scope(function() {

var AffineTransform = myphysicslab.lab.util.AffineTransform;
var DisplayObject = myphysicslab.lab.view.DisplayObject;
var NF = myphysicslab.lab.util.UtilityCore.NF;
var Rope = myphysicslab.lab.engine2D.Rope;
var SimObject = myphysicslab.lab.model.SimObject;
var UtilityCore = myphysicslab.lab.util.UtilityCore;
var Vector = myphysicslab.lab.util.Vector;

/** Displays a {@link myphysicslab.lab.engine2D.Rope} by showing a straight line when
the Rope is tight, or a jagged line when the Rope has slack. Can have a different color
when tight or slack, see {@link #setColorTight} and {@link #setColorSlack}.

The position is reported as the midpoint of the Rope by {@link #getPosition}.
The position is determined by the position of the Rope, so {@link #setPosition}
has no effect, and the DisplayRope is never dragable.

* @param {?Rope=} rope the Rope to display
* @param {?DisplayRope=} proto the prototype DisplayRope to inherit properties
*     from
* @constructor
* @final
* @struct
* @implements {DisplayObject}
*/
myphysicslab.lab.view.DisplayRope = function(rope, proto) {
  /**
  * @type {?Rope}
  * @private
  */
  this.rope_ = goog.isDefAndNotNull(rope) ? rope : null;
  /** Color when rope is tight; a CSS3 color value
  * @type {string|undefined}
  */
  this.colorTight;
  /** Color when rope is slack; a CSS3 color value
  * @type {string|undefined}
  */
  this.colorSlack;
  /** Thickness of lines when drawing the rope, in screen coordinates, so a
  * value of 1 means a 1 pixel thick line.
  * @type {number|undefined}
  */
  this.thickness;
  /**
  * @type {number|undefined}
  */
  this.zIndex;
  /**
  * @type {?DisplayRope}
  */
  this.proto = goog.isDefAndNotNull(proto) ? proto : null;
};
var DisplayRope = myphysicslab.lab.view.DisplayRope;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  DisplayRope.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        +', colorTight: "'+this.getColorTight()+'"'
        +', colorSlack: "'+this.getColorSlack()+'"'
        +', thickness: '+NF(this.getThickness())
        +', zIndex: '+this.getZIndex()
        +'}';
  };

  /** @inheritDoc */
  DisplayRope.prototype.toStringShort = function() {
    return 'DisplayRope{rope_: '+
        (this.rope_ != null ? this.rope_.toStringShort() : 'null')+'}';
  };
};

/**  the fixed length of the un-transformed path
* @type {number}
* @private
* @const
*/
DisplayRope.pathLength = 6.0;

/**  the fixed width of the un-transformed path
* @type {number}
* @private
* @const
*/
DisplayRope.pathWidth = 0.5;

/** @inheritDoc */
DisplayRope.prototype.contains = function(p_world) {
  return false;
};

/** @inheritDoc */
DisplayRope.prototype.draw = function(context, map) {
  if (this.rope_ == null) {
    return;
  }
  var len = this.rope_.getLength();
  if (len < 1e-6)
    return;
  context.save()
  context.lineWidth = this.getThickness();
  var tight = this.rope_.isTight();
  var slack = tight ? 0 : this.rope_.getRestLength() - len;
  if (tight) {
    context.strokeStyle = this.getColorTight();
  } else {
    context.strokeStyle = this.getColorSlack();
  }
  var p1 = this.rope_.getStartPoint();
  var p2 = this.rope_.getEndPoint();
  if (tight) {
    // draw as a straight line
    p1 = map.simToScreen(p1);
    p2 = map.simToScreen(p2);
    context.beginPath();
    context.moveTo(p1.getX(), p1.getY());
    context.lineTo(p2.getX(), p2.getY());
    context.stroke();
  } else {
    // note that the transforms are applied in reverse order  (because of
    // how matrix multiplication works).
    var at = map.getAffineTransform(); // sim to screen transform
    at = at.translate(p1.getX(), p1.getY());
    var theta = Math.atan2(p2.getY()-p1.getY(), p2.getX()-p1.getX());
    at = at.rotate(theta);
    // stretch out the rope to the desired length & thickness
    at = at.scale(len/DisplayRope.pathLength,
        Math.max(2*slack/DisplayRope.pathLength, 0.1));
    DisplayRope.drawRope(context, at);
  }
  context.restore();
};

/** Draws the rope using the given AffineTransform, which specifies the
combination of translating, stretching, rotating the rope to its
current position, and also the sim-to-screen transform.
The path is drawn into a size of 6.0 long by 0.5 wide, so that when it is
scaled up or down, it doesn't get too distorted.
* @param {!CanvasRenderingContext2D} context the canvas's context to draw into
* @param {!myphysicslab.lab.util.AffineTransform} at  the transform to apply to each point
* @private
*/
DisplayRope.drawRope = function(context, at) {
  /** Function to have the amount of rope oscillation change from small
  oscillation at the end points to large oscillation at the middle.
  Returns the height the rope should be away from x-axis at that point.
  @type {function(number):number}
  */
  var ropeHeight = function(x) {
    return DisplayRope.pathWidth * Math.sin(Math.PI*x/DisplayRope.pathLength);
  };

  var size = DisplayRope.pathLength;
  var t = DisplayRope.pathWidth/2; // half thickness of rope
  var w = size / 16;
  context.beginPath();
  at.moveTo(0, 0, context); // start drawing at the base
  at.lineTo(w, -ropeHeight(w), context);   // from start point
  at.lineTo(2*w, ropeHeight(2*w), context);  // ramp up
  for (var i=1; i<=3; i++) {  // 3 cycles down and up
    var x = 4*i*w;
    at.lineTo(x, -ropeHeight(x), context);
    x = (4*i + 2)*w;
    at.lineTo(x, ropeHeight(x), context);
  }
  at.lineTo(15*w, -ropeHeight(15*w), context);  // last ramp down
  at.lineTo(size, 0, context);  // to end-point
  context.stroke();
};

/** Color when rope is slack; a CSS3 color value
* @return {string}
*/
DisplayRope.prototype.getColorSlack = function() {
  if (this.colorSlack !== undefined) {
    return this.colorSlack;
  } else if (this.proto != null) {
    return this.proto.getColorSlack();
  } else {
    return 'green';
  }
};

/** Color when rope is tight; a CSS3 color value
* @return {string}
*/
DisplayRope.prototype.getColorTight = function() {
  if (this.colorTight !== undefined) {
    return this.colorTight;
  } else if (this.proto != null) {
    return this.proto.getColorTight();
  } else {
    return 'red';
  }
};

/** @inheritDoc */
DisplayRope.prototype.getMassObjects = function() {
  return [ ];
};

/** @inheritDoc */
DisplayRope.prototype.getPosition = function() {
  // return midpoint of the line
  return this.rope_ == null ? Vector.ORIGIN :
      this.rope_.getStartPoint().add(this.rope_.getEndPoint()).multiply(0.5);
};

/** @inheritDoc */
DisplayRope.prototype.getSimObjects = function() {
  return this.rope_ == null ? [ ] : [ this.rope_ ];
};

/** Thickness to use when drawing the line, in screen coordinates, so a unit
* is a screen pixel.
* @return {number}
*/
DisplayRope.prototype.getThickness = function() {
  if (this.thickness !== undefined) {
    return this.thickness;
  } else if (this.proto != null) {
    return this.proto.getThickness();
  } else {
    return 3;
  }
};

/** @inheritDoc */
DisplayRope.prototype.getZIndex = function() {
  if (this.zIndex !== undefined) {
    return this.zIndex;
  } else if (this.proto != null) {
    return this.proto.getZIndex();
  } else {
    return 0;
  }
};

/** @inheritDoc */
DisplayRope.prototype.isDragable = function() {
  return false;
};

/** Color when rope is slack; a CSS3 color value
* @param {string|undefined} value
* @return {!DisplayRope} this object for chaining setters
*/
DisplayRope.prototype.setColorSlack = function(value) {
  this.colorSlack = value;
  return this;
};

/** Color when rope is tight; a CSS3 color value
* @param {string|undefined} value
* @return {!DisplayRope} this object for chaining setters
*/
DisplayRope.prototype.setColorTight = function(value) {
  this.colorTight = value;
  return this;
};

/** @inheritDoc */
DisplayRope.prototype.setDragable = function(dragable) {
  // does nothing
};

/** @inheritDoc */
DisplayRope.prototype.setPosition = function(position) {
  //throw new Error('unsupported operation');
};

/** Thickness to use when drawing the line, in screen coordinates, so a unit
* is a screen pixel.
* @param {number|undefined} value
* @return {!DisplayRope} this object for chaining setters
*/
DisplayRope.prototype.setThickness = function(value) {
  this.thickness = value;
  return this;
};

/** @inheritDoc */
DisplayRope.prototype.setZIndex = function(zIndex) {
  this.zIndex = zIndex;
};

});  // goog.scope
