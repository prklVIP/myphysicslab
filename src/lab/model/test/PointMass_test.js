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

goog.provide('myphysicslab.lab.model.test.PointMass_test');

goog.require('goog.testing.jsunit');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.ShapeType');

var testPointMassAngle = function() {
  var Vector = myphysicslab.lab.util.Vector;
  var DoubleRect = myphysicslab.lab.util.DoubleRect;
  var PointMass = myphysicslab.lab.model.PointMass;
  var p1 = PointMass.makeOval(1, 2, 'point1');
  // set PointMass at an angle of 45 degrees clockwise
  p1.setAngle(-Math.PI/4);
  var r2 = 1/(2*Math.sqrt(2));
  assertTrue(p1.bodyToWorld(new Vector(-0.5, 1)).nearEqual(new Vector(r2, 3*r2)));
  assertTrue(p1.bodyToWorld(new Vector(0.5, 1)).nearEqual(new Vector(3*r2, r2)));
  assertTrue(p1.bodyToWorld(new Vector(-0.5, -1)).nearEqual(new Vector(-3*r2, -r2)));
  assertTrue(p1.bodyToWorld(new Vector(0.5, -1)).nearEqual(new Vector(-r2, -3*r2)));
  assertTrue(p1.worldToBody(new Vector(r2, 3*r2)).nearEqual(new Vector(-0.5, 1)));
  assertTrue(p1.worldToBody(new Vector(3*r2, r2)).nearEqual(new Vector(0.5, 1)));
  assertTrue(p1.worldToBody(new Vector(-3*r2, -r2)).nearEqual(new Vector(-0.5, -1)));
  assertTrue(p1.worldToBody(new Vector(-r2, -3*r2)).nearEqual(new Vector(0.5, -1)));
  assertRoughlyEquals(3*r2, p1.getTopWorld(), 1e-14);
  assertRoughlyEquals(3*r2, p1.getRightWorld(), 1e-14);
  assertRoughlyEquals(-3*r2, p1.getBottomWorld(), 1e-14);
  assertRoughlyEquals(-3*r2, p1.getLeftWorld(), 1e-14);
  assertTrue(p1.getBoundsWorld().nearEqual(new DoubleRect(-3*r2, -3*r2, 3*r2, 3*r2)));
  var v1 = new Vector(0, 1);
  var r3 = 1/Math.sqrt(2);
  assertTrue(p1.rotateBodyToWorld(v1).nearEqual(new Vector(r3, r3)));
  assertTrue(p1.rotateWorldToBody(v1).nearEqual(new Vector(-r3, r3)));

  // move the PointMass, still rotated 45 degrees clockwise
  p1.setPosition(new Vector(1, 1));
  assertTrue(p1.bodyToWorld(new Vector(-0.5, 1)).nearEqual(new Vector(1+r2, 1+3*r2)));
  assertTrue(p1.bodyToWorld(new Vector(0.5, 1)).nearEqual(new Vector(1+3*r2, 1+r2)));
  assertTrue(p1.bodyToWorld(new Vector(-0.5, -1)).nearEqual(new Vector(1-3*r2, 1-r2)));
  assertTrue(p1.bodyToWorld(new Vector(0.5, -1)).nearEqual(new Vector(1-r2, 1-3*r2)));
  assertTrue(p1.worldToBody(new Vector(1+r2, 1+3*r2)).nearEqual(new Vector(-0.5, 1)));
  assertTrue(p1.worldToBody(new Vector(1+3*r2, 1+r2)).nearEqual(new Vector(0.5, 1)));
  assertTrue(p1.worldToBody(new Vector(1-3*r2, 1-r2)).nearEqual(new Vector(-0.5, -1)));
  assertTrue(p1.worldToBody(new Vector(1-r2, 1-3*r2)).nearEqual(new Vector(0.5, -1)));
  assertRoughlyEquals(1+3*r2, p1.getTopWorld(), 1e-14);
  assertRoughlyEquals(1+3*r2, p1.getRightWorld(), 1e-14);
  assertRoughlyEquals(1-3*r2, p1.getBottomWorld(), 1e-14);
  assertRoughlyEquals(1-3*r2, p1.getLeftWorld(), 1e-14);
  assertTrue(p1.getBoundsWorld().nearEqual(new DoubleRect(1-3*r2, 1-3*r2, 1+3*r2, 1+3*r2)));
};
goog.exportProperty(window, 'testPointMassAngle', testPointMassAngle);

var testPointMass = function() {
  var Vector = myphysicslab.lab.util.Vector;
  var DoubleRect = myphysicslab.lab.util.DoubleRect;
  var PointMass = myphysicslab.lab.model.PointMass;
  var p1 = PointMass.makeCircle(1, 'point1');
  // instanceof works for class inheritance, but not for interfaces
  assertTrue(p1 instanceof PointMass);
  assertTrue(p1 instanceof myphysicslab.lab.model.AbstractSimObject);
  assertFalse(p1 instanceof myphysicslab.lab.model.SimObject);
  assertFalse(p1 instanceof myphysicslab.lab.model.MassObject);
  assertTrue(p1.isMassObject());
  assertEquals('POINT1', p1.getName());
  assertTrue(p1.nameEquals('point1'));
  assertEquals(Number.POSITIVE_INFINITY, p1.getExpireTime());
  assertEquals(1, p1.getMass());
  assertEquals(0, p1.getPosition().getX());
  assertEquals(0, p1.getPosition().getY());
  assertEquals(1, p1.getWidth());
  assertEquals(1, p1.getHeight());
  assertTrue(p1.getBoundsWorld().equals(new DoubleRect(-0.5, -0.5, 0.5, 0.5)));
  var p2 = PointMass.makeCircle(1, 'point2').setMass(5);
  assertEquals('POINT2', p2.getName());
  assertTrue(p2.nameEquals('point2'));
  assertEquals(5, p2.getMass());
  p2.setPosition(new Vector(97,  98));
  assertEquals(97, p2.getPosition().getX());
  assertEquals(98, p2.getPosition().getY());
  assertEquals(1, p2.getWidth());
  assertEquals(1, p2.getHeight());
  assertTrue(p2.getBoundsWorld().equals(new DoubleRect(96.5, 97.5, 97.5, 98.5)));
  p1.setPosition(p2.getPosition().subtract(new Vector(1, 1)));
  assertEquals(96, p1.getPosition().getX());
  assertEquals(97, p1.getPosition().getY());
  assertTrue(p1.getBoundsWorld().equals(new DoubleRect(95.5, 96.5, 96.5, 97.5)));
  p2.setVelocity(new Vector(6,  -7));
  assertEquals(6, p2.getVelocity().getX());
  assertEquals(-7, p2.getVelocity().getY());
  p1.setVelocity(p2.getVelocity().multiply(2));
  assertEquals(12, p1.getVelocity().getX());
  assertEquals(-14, p1.getVelocity().getY());
  var v1 = new Vector(1, 1);
  assertTrue(p2.rotateBodyToWorld(v1).equals(v1));
  assertTrue(p2.rotateWorldToBody(v1).equals(v1));
  var v2 = p2.bodyToWorld(v1);
  assertEquals(98, v2.getX());
  assertEquals(99, v2.getY());
  var v3 = p2.worldToBody(v2);
  assertEquals(v3.getX(), v1.getX());
  assertEquals(v3.getY(), v1.getY());
  p2.setExpireTime(99);
  assertEquals(99, p2.getExpireTime());
  // first character of name cannot be a number
  assertThrows(function() { new PointMass('1') });
};
goog.exportProperty(window, 'testPointMass', testPointMass);

var testPointMassSimilar = function() {
  var Vector = myphysicslab.lab.util.Vector;
  var PointMass = myphysicslab.lab.model.PointMass;
  var ShapeType = myphysicslab.lab.model.ShapeType;
  var p1 = PointMass.makeCircle(1);
  p1.setPosition(new Vector(2,  -2));
  assertTrue(p1.similar(p1));
  var p2 = PointMass.makeCircle(1).setMass(5);
  p2.setPosition(new Vector(2.01,  -2.02));
  assertTrue(p1.similar(p2, 0.015));
  // see UtilityCore.veryDifferent: tolerance is multiplied by magnitude
  assertFalse(p1.similar(p2, 0.007));
  var r1 = PointMass.makeSquare(1);
  r1.setShape(ShapeType.OVAL);
  r1.setPosition(new Vector(2,  -2));
  assertTrue(r1.similar(r1));
  var r2 = PointMass.makeSquare(1);
  r2.setShape(ShapeType.OVAL);
  r2.setPosition(new Vector(2.01,  -2.02));
  assertTrue(r1.similar(r2, 0.015));
  assertFalse(r1.similar(r2, 0.007));
  // Shows that these are similar even though they started as rectangle shape
  assertTrue(r1.similar(p1, 0.01));
  assertTrue(r2.similar(p2, 0.01));
  assertEquals(r1.getWidth(), p1.getWidth());
  assertEquals(r1.getHeight(), p1.getHeight());
  assertEquals(r1.getShape(), p1.getShape());
};
goog.exportProperty(window, 'testPointMassSimilar', testPointMassSimilar);

/**
* @suppress {checkTypes}
*/
var testPointMassThrows = function() {
  var p1 = new myphysicslab.lab.model.PointMass('point1', 0);
  assertThrows(function() {p1.setPosition(3);} );
  assertThrows(function() {p1.setPosition(null);} );
  assertThrows(function() {p1.setPosition('0');} );
  assertThrows(function() {p1.setPosition(p1);} );
};
goog.exportProperty(window, 'testPointMassThrows', testPointMassThrows);
