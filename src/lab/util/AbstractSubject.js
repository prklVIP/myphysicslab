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

goog.provide('myphysicslab.lab.util.AbstractSubject');

goog.require('goog.array');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Subject');

goog.scope(function() {

var UtilityCore = myphysicslab.lab.util.UtilityCore;
var Subject = myphysicslab.lab.util.Subject;
var ParameterBoolean = myphysicslab.lab.util.ParameterBoolean;
var ParameterNumber = myphysicslab.lab.util.ParameterNumber;
var ParameterString = myphysicslab.lab.util.ParameterString;

/** Implementation of {@link myphysicslab.lab.util.Subject} interface.

@param {string=} name
@constructor
@struct
@implements {myphysicslab.lab.util.Subject}
@abstract
*/
myphysicslab.lab.util.AbstractSubject = function(name) {
  /* This implementation makes some direct calls on itself, so it is not
  * appropriate for a [decorator class](http://en.wikipedia.org/wiki/Decorator_pattern)
  * that needs to override methods of this class. If a class calls a method on itself,
  * then that method cannot be overridden by a decorator.
  */
  if (!name) {
    throw new Error('no name');
  }
  /**
  * @type {string}
  * @private
  */
  this.name_ = UtilityCore.validName(UtilityCore.toName(name));
  /** The list of Observers of this Subject.
  * @type {!Array<!myphysicslab.lab.util.Observer>}
  * @private
  */
  this.observers_ = [];
  /**
  * @type {!Array<!myphysicslab.lab.util.Parameter>}
  * @private
  */
  this.paramList_ = [];
  /**
  * @type {boolean}
  * @private
  */
  this.doBroadcast_ = true;
};
var AbstractSubject = myphysicslab.lab.util.AbstractSubject;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  AbstractSubject.prototype.toString = function() {
    // assumes that className and name are displayed by sub-class
    return ', parameters: ['
        + goog.array.map(this.paramList_, function(p) { return p.toStringShort(); })
        +'], observers: ['
        + goog.array.map(this.observers_, function(p) { return p.toStringShort(); })
        +']}';
  };

  /** @inheritDoc */
  AbstractSubject.prototype.toStringShort = function() {
    return this.getClassName() + '{name_: "' + this.getName() + '"}';
  };
};

/** @inheritDoc */
AbstractSubject.prototype.addObserver = function(observer) {
  if (!goog.array.contains(this.observers_, observer)) {
    this.observers_.push(observer);
  }
};

/** Adds the Parameter to the list of this Subject's available Parameters.
@throws {Error} if a Parameter with the same name already exists.
@param {!myphysicslab.lab.util.Parameter} parameter the Parameter to add
*/
AbstractSubject.prototype.addParameter = function(parameter) {
  var name = parameter.getName();
  var p = this.getParam(name);
  if (p != null) {
    throw new Error('parameter '+name+' already exists: '+p);
  }
  this.paramList_.push(parameter);
};

/** @inheritDoc */
AbstractSubject.prototype.broadcast = function(evt) {
  if (this.doBroadcast_) {
    // For debugging: can see events being broadcast here.
    //if (!this.getName().match(/.*GRAPH.*/i)) { console.log('broadcast '+evt); }
    for (var i=0, len=this.observers_.length; i<len; i++) {
      this.observers_[i].observe(evt);
    }
  }
};

/** @inheritDoc */
AbstractSubject.prototype.broadcastParameter = function(name) {
  var p = this.getParam(name);
  if (p == null) {
    throw new Error('unknown Parameter '+name);
  }
  this.broadcast(p);
};

/** Returns whether this Subject is broadcasting events.
@return {boolean} whether this Subject is broadcasting events
@protected
*/
AbstractSubject.prototype.getBroadcast = function() {
  return this.doBroadcast_;
};

/** Returns name of class of this object.
* @return {string} name of class of this object.
* @abstract
*/
AbstractSubject.prototype.getClassName = function() {};

/** @inheritDoc */
AbstractSubject.prototype.getName = function() {
  return this.name_;
};

/** @inheritDoc */
AbstractSubject.prototype.getObservers = function() {
  return goog.array.clone(this.observers_);
};

/** Returns the Parameter with the given name, or null if not found
* @param {string} name name of parameter to search for
* @return {?myphysicslab.lab.util.Parameter} the Parameter with the given name, or
    null if not found
* @private
*/
AbstractSubject.prototype.getParam = function(name) {
  name = UtilityCore.toName(name);
  return goog.array.find(this.paramList_, function(p) {
    return p.getName() == name;
  });
};

/** @inheritDoc */
AbstractSubject.prototype.getParameter = function(name) {
  var p = this.getParam(name);
  if (p != null) {
    return p;
  }
  throw new Error('Parameter not found '+name);
};

/** @inheritDoc */
AbstractSubject.prototype.getParameterBoolean = function(name) {
  var p = this.getParam(name);
  if (p instanceof ParameterBoolean) {
    return p;
  }
  throw new Error('ParameterBoolean not found '+name);
};

/** @inheritDoc */
AbstractSubject.prototype.getParameterNumber = function(name) {
  var p = this.getParam(name);
  if (p instanceof ParameterNumber) {
    return p;
  }
  throw new Error('ParameterNumber not found '+name);
};

/** @inheritDoc */
AbstractSubject.prototype.getParameterString = function(name) {
  var p = this.getParam(name);
  if (p instanceof ParameterString) {
    return p;
  }
  throw new Error('ParameterString not found '+name);
};

/** @inheritDoc */
AbstractSubject.prototype.getParameters = function() {
  return goog.array.clone(this.paramList_);
};

/** @inheritDoc */
AbstractSubject.prototype.removeObserver = function(observer) {
  goog.array.remove(this.observers_, observer);
};

/** Removes the Parameter from the list of this Subject's available Parameters.
@param {!myphysicslab.lab.util.Parameter} parameter the Parameter to remove
*/
AbstractSubject.prototype.removeParameter = function(parameter) {
  goog.array.remove(this.paramList_, parameter);
};

/** Sets whether this Subject will broadcast events, typically used to temporarily
disable broadcasting. Intended to be used in situations where a subclass overrides a
method that broadcasts an event. This allows the subclass to prevent the superclass
broadcasting that event, so that the subclass can broadcast the event when the method is
completed.
@param {boolean} value whether this Subject should broadcast events
@return {boolean} the previous value
@protected
*/
AbstractSubject.prototype.setBroadcast = function(value) {
  var saveBroadcast = this.doBroadcast_;
  this.doBroadcast_ = value;
  return saveBroadcast;
};

}); // goog.scope
