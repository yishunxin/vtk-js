import * as macro from '../../../macro';
import { OBJECT_TYPE } from './Constants';

// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Static API
// ----------------------------------------------------------------------------

export const STATIC = {};

// ----------------------------------------------------------------------------
// vtkOpenGLBufferObject methods
// ----------------------------------------------------------------------------

function bufferObject(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkOpenGLBufferObject');

  // Class-specific private functions
  function convertType(type) {
    switch (type) {
      case OBJECT_TYPE.ELEMENT_ARRAY_BUFFER:
        return model.context.ELEMENT_ARRAY_BUFFER;
      case OBJECT_TYPE.TEXTURE_BUFFER:
        if ('TEXTURE_BUFFER' in model.context) {
          return model.context.TEXTURE_BUFFER;
        }
      /* eslint-disable no-fallthrough */
      // Intentional fallthrough in case there is no TEXTURE_BUFFER in WebGL
      default:
      /* eslint-enable no-fallthrough */
      case OBJECT_TYPE.ARRAY_BUFFER:
        return model.context.ARRAY_BUFFER;
    }
  }

  let internalType = null;
  let internalHandle = null;
  let dirty = true;
  let error = '';

  // Public API methods
  publicAPI.getType = () => {
    if (internalType === model.context.ARRAY_BUFFER) {
      return OBJECT_TYPE.ARRAY_BUFFER;
    }
    if (internalType === model.context.ELEMENT_ARRAY_BUFFER) {
      return OBJECT_TYPE.ELEMENT_ARRAY_BUFFER;
    }
    return OBJECT_TYPE.TEXTURE_BUFFER;
  };

  publicAPI.setType = value => {
    internalType = convertType(value);
  };

  publicAPI.getHandle = () => internalHandle;
  publicAPI.isReady = () => dirty === false;

  publicAPI.generateBuffer = type => {
    const objectTypeGL = convertType(type);
    if (internalHandle === null) {
      internalHandle = model.context.createBuffer();
      internalType = objectTypeGL;
    }
    return (internalType === objectTypeGL);
  };

  publicAPI.upload = (data, type) => {
    // buffer, size, type
    const alreadyGenerated = publicAPI.generateBuffer(type);
    if (alreadyGenerated) {
      error = 'Trying to upload array buffer to incompatible buffer.';
      return false;
    }
    model.context.bindBuffer(internalType, internalHandle);
    model.context.bufferData(internalType, data, model.context.STATIC_DRAW);
    dirty = false;
    return true;
  };

  publicAPI.bind = () => {
    if (!internalHandle) {
      return false;
    }
    model.context.bindBuffer(internalType, internalHandle);
    return true;
  };

  publicAPI.release = () => {
    if (!internalHandle) {
      return false;
    }
    model.context.bindBuffer(internalType, null);
    return true;
  };

  publicAPI.releaseGraphicsResources = () => {
    if (internalHandle !== null) {
      model.context.bindBuffer(internalType, null);
      model.context.deleteBuffers(internalHandle);
      internalHandle = null;
    }
  };

  publicAPI.getError = () => error;
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  objectType: OBJECT_TYPE.ARRAY_BUFFER,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Object methods
  macro.obj(publicAPI, model);
  bufferObject(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend }, STATIC);