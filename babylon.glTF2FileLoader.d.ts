import { IGLTFValidationResults } from "babylon.gltf2interface";

declare module BABYLON {
    /**
     * Mode that determines the coordinate system to use.
     */
    enum GLTFLoaderCoordinateSystemMode {
        /**
         * Automatically convert the glTF right-handed data to the appropriate system based on the current coordinate system mode of the scene.
         */
        AUTO = 0,
        /**
         * Sets the useRightHandedSystem flag on the scene.
         */
        FORCE_RIGHT_HANDED = 1
    }
    /**
     * Mode that determines what animations will start.
     */
    enum GLTFLoaderAnimationStartMode {
        /**
         * No animation will start.
         */
        NONE = 0,
        /**
         * The first animation will start.
         */
        FIRST = 1,
        /**
         * All animations will start.
         */
        ALL = 2
    }
    /**
     * Interface that contains the data for the glTF asset.
     */
    interface IGLTFLoaderData {
        /**
         * Object that represents the glTF JSON.
         */
        json: Object;
        /**
         * The BIN chunk of a binary glTF.
         */
        bin: Nullable<ArrayBufferView>;
    }
    /**
     * Interface for extending the loader.
     */
    interface IGLTFLoaderExtension {
        /**
         * The name of this extension.
         */
        readonly name: string;
        /**
         * Defines whether this extension is enabled.
         */
        enabled: boolean;
    }
    /**
     * Loader state.
     */
    enum GLTFLoaderState {
        /**
         * The asset is loading.
         */
        LOADING = 0,
        /**
         * The asset is ready for rendering.
         */
        READY = 1,
        /**
         * The asset is completely loaded.
         */
        COMPLETE = 2
    }
    /** @hidden */
    interface IGLTFLoader extends IDisposable {
        readonly state: Nullable<GLTFLoaderState>;
        importMeshAsync: (meshesNames: any, scene: Scene, data: IGLTFLoaderData, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string) => Promise<{
            meshes: AbstractMesh[];
            particleSystems: IParticleSystem[];
            skeletons: Skeleton[];
            animationGroups: AnimationGroup[];
        }>;
        loadAsync: (scene: Scene, data: IGLTFLoaderData, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string) => Promise<void>;
    }
    /**
     * File loader for loading glTF files into a scene.
     */
    class GLTFFileLoader implements IDisposable, ISceneLoaderPluginAsync, ISceneLoaderPluginFactory {
        /** @hidden */
        static _CreateGLTFLoaderV1: (parent: GLTFFileLoader) => IGLTFLoader;
        /** @hidden */
        static _CreateGLTFLoaderV2: (parent: GLTFFileLoader) => IGLTFLoader;
        /**
         * Raised when the asset has been parsed
         */
        onParsedObservable: Observable<IGLTFLoaderData>;
        private _onParsedObserver;
        /**
         * Raised when the asset has been parsed
         */
        onParsed: (loaderData: IGLTFLoaderData) => void;
        /**
         * Set this property to false to disable incremental loading which delays the loader from calling the success callback until after loading the meshes and shaders.
         * Textures always loads asynchronously. For example, the success callback can compute the bounding information of the loaded meshes when incremental loading is disabled.
         * Defaults to true.
         * @hidden
         */
        static IncrementalLoading: boolean;
        /**
         * Set this property to true in order to work with homogeneous coordinates, available with some converters and exporters.
         * Defaults to false. See https://en.wikipedia.org/wiki/Homogeneous_coordinates.
         * @hidden
         */
        static HomogeneousCoordinates: boolean;
        /**
         * The coordinate system mode. Defaults to AUTO.
         */
        coordinateSystemMode: GLTFLoaderCoordinateSystemMode;
        /**
        * The animation start mode. Defaults to FIRST.
        */
        animationStartMode: GLTFLoaderAnimationStartMode;
        /**
         * Defines if the loader should compile materials before raising the success callback. Defaults to false.
         */
        compileMaterials: boolean;
        /**
         * Defines if the loader should also compile materials with clip planes. Defaults to false.
         */
        useClipPlane: boolean;
        /**
         * Defines if the loader should compile shadow generators before raising the success callback. Defaults to false.
         */
        compileShadowGenerators: boolean;
        /**
         * Defines if the Alpha blended materials are only applied as coverage.
         * If false, (default) The luminance of each pixel will reduce its opacity to simulate the behaviour of most physical materials.
         * If true, no extra effects are applied to transparent pixels.
         */
        transparencyAsCoverage: boolean;
        /**
         * Function called before loading a url referenced by the asset.
         */
        preprocessUrlAsync: (url: string) => Promise<string>;
        /**
         * Observable raised when the loader creates a mesh after parsing the glTF properties of the mesh.
         */
        readonly onMeshLoadedObservable: Observable<AbstractMesh>;
        private _onMeshLoadedObserver;
        /**
         * Callback raised when the loader creates a mesh after parsing the glTF properties of the mesh.
         */
        onMeshLoaded: (mesh: AbstractMesh) => void;
        /**
         * Observable raised when the loader creates a texture after parsing the glTF properties of the texture.
         */
        readonly onTextureLoadedObservable: Observable<BaseTexture>;
        private _onTextureLoadedObserver;
        /**
         * Callback raised when the loader creates a texture after parsing the glTF properties of the texture.
         */
        onTextureLoaded: (texture: BaseTexture) => void;
        /**
         * Observable raised when the loader creates a material after parsing the glTF properties of the material.
         */
        readonly onMaterialLoadedObservable: Observable<Material>;
        private _onMaterialLoadedObserver;
        /**
         * Callback raised when the loader creates a material after parsing the glTF properties of the material.
         */
        onMaterialLoaded: (material: Material) => void;
        /**
         * Observable raised when the loader creates a camera after parsing the glTF properties of the camera.
         */
        readonly onCameraLoadedObservable: Observable<Camera>;
        private _onCameraLoadedObserver;
        /**
         * Callback raised when the loader creates a camera after parsing the glTF properties of the camera.
         */
        onCameraLoaded: (camera: Camera) => void;
        /**
         * Observable raised when the asset is completely loaded, immediately before the loader is disposed.
         * For assets with LODs, raised when all of the LODs are complete.
         * For assets without LODs, raised when the model is complete, immediately after the loader resolves the returned promise.
         */
        readonly onCompleteObservable: Observable<void>;
        private _onCompleteObserver;
        /**
         * Callback raised when the asset is completely loaded, immediately before the loader is disposed.
         * For assets with LODs, raised when all of the LODs are complete.
         * For assets without LODs, raised when the model is complete, immediately after the loader resolves the returned promise.
         */
        onComplete: () => void;
        /**
         * Observable raised when an error occurs.
         */
        readonly onErrorObservable: Observable<any>;
        private _onErrorObserver;
        /**
         * Callback raised when an error occurs.
         */
        onError: (reason: any) => void;
        /**
         * Observable raised after the loader is disposed.
         */
        readonly onDisposeObservable: Observable<void>;
        private _onDisposeObserver;
        /**
         * Callback raised after the loader is disposed.
         */
        onDispose: () => void;
        /**
         * Observable raised after a loader extension is created.
         * Set additional options for a loader extension in this event.
         */
        readonly onExtensionLoadedObservable: Observable<IGLTFLoaderExtension>;
        private _onExtensionLoadedObserver;
        /**
         * Callback raised after a loader extension is created.
         */
        onExtensionLoaded: (extension: IGLTFLoaderExtension) => void;
        /**
         * Defines if the loader logging is enabled.
         */
        loggingEnabled: boolean;
        /**
         * Defines if the loader should capture performance counters.
         */
        capturePerformanceCounters: boolean;
        /**
         * Defines if the loader should validate the asset.
         */
        validate: boolean;
        /**
         * Observable raised after validation when validate is set to true. The event data is the result of the validation.
         */
        readonly onValidatedObservable: Observable<IGLTFValidationResults>;
        private _onValidatedObserver;
        /**
         * Callback raised after a loader extension is created.
         */
        onValidated: (results: IGLTFValidationResults) => void;
        private _loader;
        /**
         * Name of the loader ("gltf")
         */
        name: string;
        /**
         * Supported file extensions of the loader (.gltf, .glb)
         */
        extensions: ISceneLoaderPluginExtensions;
        /**
         * Disposes the loader, releases resources during load, and cancels any outstanding requests.
         */
        dispose(): void;
        /** @hidden */
        _clear(): void;
        /**
         * Imports one or more meshes from the loaded glTF data and adds them to the scene
         * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
         * @param scene the scene the meshes should be added to
         * @param data the glTF data to load
         * @param rootUrl root url to load from
         * @param onProgress event that fires when loading progress has occured
         * @param fileName Defines the name of the file to load
         * @returns a promise containg the loaded meshes, particles, skeletons and animations
         */
        importMeshAsync(meshesNames: any, scene: Scene, data: any, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string): Promise<{
            meshes: AbstractMesh[];
            particleSystems: IParticleSystem[];
            skeletons: Skeleton[];
            animationGroups: AnimationGroup[];
        }>;
        /**
         * Imports all objects from the loaded glTF data and adds them to the scene
         * @param scene the scene the objects should be added to
         * @param data the glTF data to load
         * @param rootUrl root url to load from
         * @param onProgress event that fires when loading progress has occured
         * @param fileName Defines the name of the file to load
         * @returns a promise which completes when objects have been loaded to the scene
         */
        loadAsync(scene: Scene, data: string | ArrayBuffer, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string): Promise<void>;
        /**
         * Load into an asset container.
         * @param scene The scene to load into
         * @param data The data to import
         * @param rootUrl The root url for scene and resources
         * @param onProgress The callback when the load progresses
         * @param fileName Defines the name of the file to load
         * @returns The loaded asset container
         */
        loadAssetContainerAsync(scene: Scene, data: string | ArrayBuffer, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string): Promise<AssetContainer>;
        /**
         * If the data string can be loaded directly.
         * @param data string contianing the file data
         * @returns if the data can be loaded directly
         */
        canDirectLoad(data: string): boolean;
        /**
         * Rewrites a url by combining a root url and response url.
         */
        rewriteRootURL: (rootUrl: string, responseURL?: string) => string;
        /**
         * Instantiates a glTF file loader plugin.
         * @returns the created plugin
         */
        createPlugin(): ISceneLoaderPlugin | ISceneLoaderPluginAsync;
        /**
         * The loader state or null if the loader is not active.
         */
        readonly loaderState: Nullable<GLTFLoaderState>;
        /**
         * Returns a promise that resolves when the asset is completely loaded.
         * @returns a promise that resolves when the asset is completely loaded.
         */
        whenCompleteAsync(): Promise<void>;
        private _parseAsync;
        private _validateAsync;
        private _getLoader;
        private _unpackBinary;
        private _unpackBinaryV1;
        private _unpackBinaryV2;
        private static _parseVersion;
        private static _compareVersion;
        private static _decodeBufferToText;
        private static readonly _logSpaces;
        private _logIndentLevel;
        private _loggingEnabled;
        /** @hidden */
        _log: (message: string) => void;
        /** @hidden */
        _logOpen(message: string): void;
        /** @hidden */
        _logClose(): void;
        private _logEnabled;
        private _logDisabled;
        private _capturePerformanceCounters;
        /** @hidden */
        _startPerformanceCounter: (counterName: string) => void;
        /** @hidden */
        _endPerformanceCounter: (counterName: string) => void;
        private _startPerformanceCounterEnabled;
        private _startPerformanceCounterDisabled;
        private _endPerformanceCounterEnabled;
        private _endPerformanceCounterDisabled;
    }
}


declare module BABYLON.GLTF2.Loader {
    /**
     * Loader interface with an index field.
     */
    interface IArrayItem {
        /**
         * The index of this item in the array.
         */
        index: number;
    }
    /**
     * Loader interface with additional members.
     */
    interface IAccessor extends GLTF2.IAccessor, IArrayItem {
        /** @hidden */
        _data?: Promise<ArrayBufferView>;
        /** @hidden */
        _babylonVertexBuffer?: Promise<VertexBuffer>;
    }
    /**
     * Loader interface with additional members.
     */
    interface IAnimationChannel extends GLTF2.IAnimationChannel, IArrayItem {
    }
    /** @hidden */
    interface _IAnimationSamplerData {
        input: Float32Array;
        interpolation: AnimationSamplerInterpolation;
        output: Float32Array;
    }
    /**
     * Loader interface with additional members.
     */
    interface IAnimationSampler extends GLTF2.IAnimationSampler, IArrayItem {
        /** @hidden */
        _data?: Promise<_IAnimationSamplerData>;
    }
    /**
     * Loader interface with additional members.
     */
    interface IAnimation extends GLTF2.IAnimation, IArrayItem {
        channels: IAnimationChannel[];
        samplers: IAnimationSampler[];
        /** @hidden */
        _babylonAnimationGroup?: AnimationGroup;
    }
    /**
     * Loader interface with additional members.
     */
    interface IBuffer extends GLTF2.IBuffer, IArrayItem {
        /** @hidden */
        _data?: Promise<ArrayBufferView>;
    }
    /**
     * Loader interface with additional members.
     */
    interface IBufferView extends GLTF2.IBufferView, IArrayItem {
        /** @hidden */
        _data?: Promise<ArrayBufferView>;
        /** @hidden */
        _babylonBuffer?: Promise<Buffer>;
    }
    /**
     * Loader interface with additional members.
     */
    interface ICamera extends GLTF2.ICamera, IArrayItem {
    }
    /**
     * Loader interface with additional members.
     */
    interface IImage extends GLTF2.IImage, IArrayItem {
        /** @hidden */
        _data?: Promise<ArrayBufferView>;
    }
    /**
     * Loader interface with additional members.
     */
    interface IMaterialNormalTextureInfo extends GLTF2.IMaterialNormalTextureInfo, ITextureInfo {
    }
    /**
     * Loader interface with additional members.
     */
    interface IMaterialOcclusionTextureInfo extends GLTF2.IMaterialOcclusionTextureInfo, ITextureInfo {
    }
    /**
     * Loader interface with additional members.
     */
    interface IMaterialPbrMetallicRoughness extends GLTF2.IMaterialPbrMetallicRoughness {
        baseColorTexture?: ITextureInfo;
        metallicRoughnessTexture?: ITextureInfo;
    }
    /**
     * Loader interface with additional members.
     */
    interface IMaterial extends GLTF2.IMaterial, IArrayItem {
        pbrMetallicRoughness?: IMaterialPbrMetallicRoughness;
        normalTexture?: IMaterialNormalTextureInfo;
        occlusionTexture?: IMaterialOcclusionTextureInfo;
        emissiveTexture?: ITextureInfo;
        /** @hidden */
        _babylonData?: {
            [drawMode: number]: {
                material: Material;
                meshes: AbstractMesh[];
                promise: Promise<void>;
            };
        };
    }
    /**
     * Loader interface with additional members.
     */
    interface IMesh extends GLTF2.IMesh, IArrayItem {
        primitives: IMeshPrimitive[];
    }
    /**
     * Loader interface with additional members.
     */
    interface IMeshPrimitive extends GLTF2.IMeshPrimitive, IArrayItem {
    }
    /**
     * Loader interface with additional members.
     */
    interface INode extends GLTF2.INode, IArrayItem {
        /**
         * The parent glTF node.
         */
        parent?: INode;
        /** @hidden */
        _babylonMesh?: Mesh;
        /** @hidden */
        _primitiveBabylonMeshes?: Mesh[];
        /** @hidden */
        _babylonBones?: Bone[];
        /** @hidden */
        _numMorphTargets?: number;
    }
    /** @hidden */
    interface _ISamplerData {
        noMipMaps: boolean;
        samplingMode: number;
        wrapU: number;
        wrapV: number;
    }
    /**
     * Loader interface with additional members.
     */
    interface ISampler extends GLTF2.ISampler, IArrayItem {
        /** @hidden */
        _data?: _ISamplerData;
    }
    /**
     * Loader interface with additional members.
     */
    interface IScene extends GLTF2.IScene, IArrayItem {
    }
    /**
     * Loader interface with additional members.
     */
    interface ISkin extends GLTF2.ISkin, IArrayItem {
        /** @hidden */
        _babylonSkeleton?: Skeleton;
        /** @hidden */
        _promise?: Promise<void>;
    }
    /**
     * Loader interface with additional members.
     */
    interface ITexture extends GLTF2.ITexture, IArrayItem {
    }
    /**
     * Loader interface with additional members.
     */
    interface ITextureInfo extends GLTF2.ITextureInfo {
    }
    /**
     * Loader interface with additional members.
     */
    interface IGLTF extends GLTF2.IGLTF {
        accessors?: IAccessor[];
        animations?: IAnimation[];
        buffers?: IBuffer[];
        bufferViews?: IBufferView[];
        cameras?: ICamera[];
        images?: IImage[];
        materials?: IMaterial[];
        meshes?: IMesh[];
        nodes?: INode[];
        samplers?: ISampler[];
        scenes?: IScene[];
        skins?: ISkin[];
        textures?: ITexture[];
    }
}


/**
 * Defines the module for importing and exporting glTF 2.0 assets
 */
declare module BABYLON.GLTF2 {
    /**
     * Helper class for working with arrays when loading the glTF asset
     */
    class ArrayItem {
        /**
         * Gets an item from the given array.
         * @param context The context when loading the asset
         * @param array The array to get the item from
         * @param index The index to the array
         * @returns The array item
         */
        static Get<T>(context: string, array: ArrayLike<T> | undefined, index: number | undefined): T;
        /**
         * Assign an `index` field to each item of the given array.
         * @param array The array of items
         */
        static Assign(array?: Loader.IArrayItem[]): void;
    }
    /**
     * The glTF 2.0 loader
     */
    class GLTFLoader implements IGLTFLoader {
        /** The glTF object parsed from the JSON. */
        gltf: Loader.IGLTF;
        /** The Babylon scene when loading the asset. */
        babylonScene: Scene;
        /** @hidden */
        _completePromises: Promise<any>[];
        private _disposed;
        private _parent;
        private _state;
        private _extensions;
        private _rootUrl;
        private _fileName;
        private _uniqueRootUrl;
        private _rootBabylonMesh;
        private _defaultBabylonMaterialData;
        private _progressCallback?;
        private _requests;
        private static readonly _DefaultSampler;
        private static _ExtensionNames;
        private static _ExtensionFactories;
        /**
         * Registers a loader extension.
         * @param name The name of the loader extension.
         * @param factory The factory function that creates the loader extension.
         */
        static RegisterExtension(name: string, factory: (loader: GLTFLoader) => IGLTFLoaderExtension): void;
        /**
         * Unregisters a loader extension.
         * @param name The name of the loader extenion.
         * @returns A boolean indicating whether the extension has been unregistered
         */
        static UnregisterExtension(name: string): boolean;
        /**
         * Gets the loader state.
         */
        readonly state: Nullable<GLTFLoaderState>;
        /** @hidden */
        constructor(parent: GLTFFileLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        importMeshAsync(meshesNames: any, scene: Scene, data: IGLTFLoaderData, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string): Promise<{
            meshes: AbstractMesh[];
            particleSystems: IParticleSystem[];
            skeletons: Skeleton[];
            animationGroups: AnimationGroup[];
        }>;
        /** @hidden */
        loadAsync(scene: Scene, data: IGLTFLoaderData, rootUrl: string, onProgress?: (event: SceneLoaderProgressEvent) => void, fileName?: string): Promise<void>;
        private _loadAsync;
        private _loadData;
        private _setupData;
        private _loadExtensions;
        private _checkExtensions;
        private _setState;
        private _createRootNode;
        /**
         * Loads a glTF scene.
         * @param context The context when loading the asset
         * @param scene The glTF scene property
         * @returns A promise that resolves when the load is complete
         */
        loadSceneAsync(context: string, scene: Loader.IScene): Promise<void>;
        private _forEachPrimitive;
        private _getMeshes;
        private _getSkeletons;
        private _getAnimationGroups;
        private _startAnimations;
        /**
         * Loads a glTF node.
         * @param context The context when loading the asset
         * @param node The glTF node property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon mesh when the load is complete
         */
        loadNodeAsync(context: string, node: Loader.INode, assign?: (babylonMesh: Mesh) => void): Promise<Mesh>;
        private _loadMeshAsync;
        private _loadMeshPrimitiveAsync;
        private _loadVertexDataAsync;
        private _createMorphTargets;
        private _loadMorphTargetsAsync;
        private _loadMorphTargetVertexDataAsync;
        private static _LoadTransform;
        private _loadSkinAsync;
        private _loadBones;
        private _loadBone;
        private _loadSkinInverseBindMatricesDataAsync;
        private _updateBoneMatrices;
        private _getNodeMatrix;
        /**
         * Loads a glTF camera.
         * @param context The context when loading the asset
         * @param camera The glTF camera property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon camera when the load is complete
         */
        loadCameraAsync(context: string, camera: Loader.ICamera, assign?: (babylonCamera: Camera) => void): Promise<Camera>;
        private _loadAnimationsAsync;
        /**
         * Loads a glTF animation.
         * @param context The context when loading the asset
         * @param animation The glTF animation property
         * @returns A promise that resolves with the loaded Babylon animation group when the load is complete
         */
        loadAnimationAsync(context: string, animation: Loader.IAnimation): Promise<AnimationGroup>;
        private _loadAnimationChannelAsync;
        private _loadAnimationSamplerAsync;
        private _loadBufferAsync;
        /**
         * Loads a glTF buffer view.
         * @param context The context when loading the asset
         * @param bufferView The glTF buffer view property
         * @returns A promise that resolves with the loaded data when the load is complete
         */
        loadBufferViewAsync(context: string, bufferView: Loader.IBufferView): Promise<ArrayBufferView>;
        private _loadIndicesAccessorAsync;
        private _loadFloatAccessorAsync;
        private _loadVertexBufferViewAsync;
        private _loadVertexAccessorAsync;
        private _loadMaterialMetallicRoughnessPropertiesAsync;
        /** @hidden */
        _loadMaterialAsync(context: string, material: Loader.IMaterial, babylonMesh: Mesh, babylonDrawMode: number, assign?: (babylonMaterial: Material) => void): Promise<Material>;
        private _createDefaultMaterial;
        /**
         * Creates a Babylon material from a glTF material.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonDrawMode The draw mode for the Babylon material
         * @returns The Babylon material
         */
        createMaterial(context: string, material: Loader.IMaterial, babylonDrawMode: number): Material;
        /**
         * Loads properties from a glTF material into a Babylon material.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonMaterial The Babylon material
         * @returns A promise that resolves when the load is complete
         */
        loadMaterialPropertiesAsync(context: string, material: Loader.IMaterial, babylonMaterial: Material): Promise<void>;
        /**
         * Loads the normal, occlusion, and emissive properties from a glTF material into a Babylon material.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonMaterial The Babylon material
         * @returns A promise that resolves when the load is complete
         */
        loadMaterialBasePropertiesAsync(context: string, material: Loader.IMaterial, babylonMaterial: Material): Promise<void>;
        /**
         * Loads the alpha properties from a glTF material into a Babylon material.
         * Must be called after the setting the albedo texture of the Babylon material when the material has an albedo texture.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonMaterial The Babylon material
         */
        loadMaterialAlphaProperties(context: string, material: Loader.IMaterial, babylonMaterial: Material): void;
        /**
         * Loads a glTF texture info.
         * @param context The context when loading the asset
         * @param textureInfo The glTF texture info property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon texture when the load is complete
         */
        loadTextureInfoAsync(context: string, textureInfo: Loader.ITextureInfo, assign?: (babylonTexture: BaseTexture) => void): Promise<BaseTexture>;
        private _loadTextureAsync;
        private _loadSampler;
        /**
         * Loads a glTF image.
         * @param context The context when loading the asset
         * @param image The glTF image property
         * @returns A promise that resolves with the loaded data when the load is complete
         */
        loadImageAsync(context: string, image: Loader.IImage): Promise<ArrayBufferView>;
        /**
         * Loads a glTF uri.
         * @param context The context when loading the asset
         * @param uri The base64 or relative uri
         * @returns A promise that resolves with the loaded data when the load is complete
         */
        loadUriAsync(context: string, uri: string): Promise<ArrayBufferView>;
        private _onProgress;
        private static _GetTextureWrapMode;
        private static _GetTextureSamplingMode;
        private static _GetTypedArray;
        private static _GetNumComponents;
        private static _ValidateUri;
        private static _GetDrawMode;
        private _compileMaterialsAsync;
        private _compileShadowGeneratorsAsync;
        private _forEachExtensions;
        private _applyExtensions;
        private _extensionsOnLoading;
        private _extensionsOnReady;
        private _extensionsLoadSceneAsync;
        private _extensionsLoadNodeAsync;
        private _extensionsLoadCameraAsync;
        private _extensionsLoadVertexDataAsync;
        private _extensionsLoadMaterialAsync;
        private _extensionsCreateMaterial;
        private _extensionsLoadMaterialPropertiesAsync;
        private _extensionsLoadTextureInfoAsync;
        private _extensionsLoadAnimationAsync;
        private _extensionsLoadUriAsync;
        /**
         * Helper method called by a loader extension to load an glTF extension.
         * @param context The context when loading the asset
         * @param property The glTF property to load the extension from
         * @param extensionName The name of the extension to load
         * @param actionAsync The action to run
         * @returns The promise returned by actionAsync or null if the extension does not exist
         */
        static LoadExtensionAsync<TExtension = any, TResult = void>(context: string, property: IProperty, extensionName: string, actionAsync: (extensionContext: string, extension: TExtension) => Nullable<Promise<TResult>>): Nullable<Promise<TResult>>;
        /**
         * Helper method called by a loader extension to load a glTF extra.
         * @param context The context when loading the asset
         * @param property The glTF property to load the extra from
         * @param extensionName The name of the extension to load
         * @param actionAsync The action to run
         * @returns The promise returned by actionAsync or null if the extra does not exist
         */
        static LoadExtraAsync<TExtra = any, TResult = void>(context: string, property: IProperty, extensionName: string, actionAsync: (extraContext: string, extra: TExtra) => Nullable<Promise<TResult>>): Nullable<Promise<TResult>>;
        /**
         * Increments the indentation level and logs a message.
         * @param message The message to log
         */
        logOpen(message: string): void;
        /**
         * Decrements the indentation level.
         */
        logClose(): void;
        /**
         * Logs a message
         * @param message The message to log
         */
        log(message: string): void;
        /**
         * Starts a performance counter.
         * @param counterName The name of the performance counter
         */
        startPerformanceCounter(counterName: string): void;
        /**
         * Ends a performance counter.
         * @param counterName The name of the performance counter
         */
        endPerformanceCounter(counterName: string): void;
    }
}


declare module BABYLON.GLTF2 {
    /**
     * Interface for a glTF loader extension.
     */
    interface IGLTFLoaderExtension extends BABYLON.IGLTFLoaderExtension, IDisposable {
        /**
         * Called after the loader state changes to LOADING.
         */
        onLoading?(): void;
        /**
         * Called after the loader state changes to READY.
         */
        onReady?(): void;
        /**
         * Define this method to modify the default behavior when loading scenes.
         * @param context The context when loading the asset
         * @param scene The glTF scene property
         * @returns A promise that resolves when the load is complete or null if not handled
         */
        loadSceneAsync?(context: string, scene: Loader.IScene): Nullable<Promise<void>>;
        /**
         * Define this method to modify the default behavior when loading nodes.
         * @param context The context when loading the asset
         * @param node The glTF node property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon mesh when the load is complete or null if not handled
         */
        loadNodeAsync?(context: string, node: Loader.INode, assign: (babylonMesh: Mesh) => void): Nullable<Promise<Mesh>>;
        /**
         * Define this method to modify the default behavior when loading cameras.
         * @param context The context when loading the asset
         * @param camera The glTF camera property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon camera when the load is complete or null if not handled
         */
        loadCameraAsync?(context: string, camera: Loader.ICamera, assign: (babylonCamera: Camera) => void): Nullable<Promise<Camera>>;
        /**
         * @hidden Define this method to modify the default behavior when loading vertex data for mesh primitives.
         * @param context The context when loading the asset
         * @param primitive The glTF mesh primitive property
         * @returns A promise that resolves with the loaded geometry when the load is complete or null if not handled
         */
        _loadVertexDataAsync?(context: string, primitive: Loader.IMeshPrimitive, babylonMesh: Mesh): Nullable<Promise<Geometry>>;
        /**
         * @hidden Define this method to modify the default behavior when loading materials. Load material creates the material and then loads material properties.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon material when the load is complete or null if not handled
         */
        _loadMaterialAsync?(context: string, material: Loader.IMaterial, babylonMesh: Mesh, babylonDrawMode: number, assign: (babylonMaterial: Material) => void): Nullable<Promise<Material>>;
        /**
         * Define this method to modify the default behavior when creating materials.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonDrawMode The draw mode for the Babylon material
         * @returns The Babylon material or null if not handled
         */
        createMaterial?(context: string, material: Loader.IMaterial, babylonDrawMode: number): Nullable<Material>;
        /**
         * Define this method to modify the default behavior when loading material properties.
         * @param context The context when loading the asset
         * @param material The glTF material property
         * @param babylonMaterial The Babylon material
         * @returns A promise that resolves when the load is complete or null if not handled
         */
        loadMaterialPropertiesAsync?(context: string, material: Loader.IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
        /**
         * Define this method to modify the default behavior when loading texture infos.
         * @param context The context when loading the asset
         * @param textureInfo The glTF texture info property
         * @param assign A function called synchronously after parsing the glTF properties
         * @returns A promise that resolves with the loaded Babylon texture when the load is complete or null if not handled
         */
        loadTextureInfoAsync?(context: string, textureInfo: Loader.ITextureInfo, assign: (babylonTexture: BaseTexture) => void): Nullable<Promise<BaseTexture>>;
        /**
         * Define this method to modify the default behavior when loading animations.
         * @param context The context when loading the asset
         * @param animation The glTF animation property
         * @returns A promise that resolves with the loaded Babylon animation group when the load is complete or null if not handled
         */
        loadAnimationAsync?(context: string, animation: Loader.IAnimation): Nullable<Promise<AnimationGroup>>;
        /**
         * Define this method to modify the default behavior when loading uris.
         * @param context The context when loading the asset
         * @param uri The uri to load
         * @returns A promise that resolves with the loaded data when the load is complete or null if not handled
         */
        _loadUriAsync?(context: string, uri: string): Nullable<Promise<ArrayBufferView>>;
    }
}
/**
 * Defines the module for the built-in glTF 2.0 loader extensions.
 */
declare module BABYLON.GLTF2.Loader.Extensions {
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_lod)
     */
    class MSFT_lod implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        /**
         * Maximum number of LODs to load, starting from the lowest LOD.
         */
        maxLODsToLoad: number;
        /**
         * Observable raised when all node LODs of one level are loaded.
         * The event data is the index of the loaded LOD starting from zero.
         * Dispose the loader to cancel the loading of the next level of LODs.
         */
        onNodeLODsLoadedObservable: Observable<number>;
        /**
         * Observable raised when all material LODs of one level are loaded.
         * The event data is the index of the loaded LOD starting from zero.
         * Dispose the loader to cancel the loading of the next level of LODs.
         */
        onMaterialLODsLoadedObservable: Observable<number>;
        private _loader;
        private _nodeIndexLOD;
        private _nodeSignalLODs;
        private _nodePromiseLODs;
        private _materialIndexLOD;
        private _materialSignalLODs;
        private _materialPromiseLODs;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        onReady(): void;
        /** @hidden */
        loadNodeAsync(context: string, node: INode, assign: (babylonMesh: Mesh) => void): Nullable<Promise<Mesh>>;
        /** @hidden */
        _loadMaterialAsync(context: string, material: IMaterial, babylonMesh: Mesh, babylonDrawMode: number, assign: (babylonMaterial: Material) => void): Nullable<Promise<Material>>;
        /** @hidden */
        _loadUriAsync(context: string, uri: string): Nullable<Promise<ArrayBufferView>>;
        /**
         * Gets an array of LOD properties from lowest to highest.
         */
        private _getLODs;
        private _disposeUnusedMaterials;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /** @hidden */
    class MSFT_minecraftMesh implements IGLTFLoaderExtension {
        readonly name: string;
        enabled: boolean;
        private _loader;
        constructor(loader: GLTFLoader);
        dispose(): void;
        loadMaterialPropertiesAsync(context: string, material: IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /** @hidden */
    class MSFT_sRGBFactors implements IGLTFLoaderExtension {
        readonly name: string;
        enabled: boolean;
        private _loader;
        constructor(loader: GLTFLoader);
        dispose(): void;
        loadMaterialPropertiesAsync(context: string, material: IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/najadojo/glTF/tree/MSFT_audio_emitter/extensions/2.0/Vendor/MSFT_audio_emitter)
     */
    class MSFT_audio_emitter implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        private _clips;
        private _emitters;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        onLoading(): void;
        /** @hidden */
        loadSceneAsync(context: string, scene: IScene): Nullable<Promise<void>>;
        /** @hidden */
        loadNodeAsync(context: string, node: INode, assign: (babylonMesh: Mesh) => void): Nullable<Promise<Mesh>>;
        /** @hidden */
        loadAnimationAsync(context: string, animation: IAnimation): Nullable<Promise<AnimationGroup>>;
        private _loadClipAsync;
        private _loadEmitterAsync;
        private _getEventAction;
        private _loadAnimationEventAsync;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression)
     */
    class KHR_draco_mesh_compression implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        private _dracoCompression?;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        _loadVertexDataAsync(context: string, primitive: IMeshPrimitive, babylonMesh: Mesh): Nullable<Promise<Geometry>>;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness)
     */
    class KHR_materials_pbrSpecularGlossiness implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        loadMaterialPropertiesAsync(context: string, material: IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
        private _loadSpecularGlossinessPropertiesAsync;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit)
     */
    class KHR_materials_unlit implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        loadMaterialPropertiesAsync(context: string, material: IMaterial, babylonMaterial: Material): Nullable<Promise<void>>;
        private _loadUnlitPropertiesAsync;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/1048d162a44dbcb05aefc1874bfd423cf60135a6/extensions/2.0/Khronos/KHR_lights_punctual/README.md) (Experimental)
     */
    class KHR_lights implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        private _lights?;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        onLoading(): void;
        /** @hidden */
        loadNodeAsync(context: string, node: INode, assign: (babylonMesh: Mesh) => void): Nullable<Promise<Mesh>>;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_texture_transform/README.md)
     */
    class KHR_texture_transform implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        loadTextureInfoAsync(context: string, textureInfo: ITextureInfo, assign: (babylonTexture: BaseTexture) => void): Nullable<Promise<BaseTexture>>;
    }
}


declare module BABYLON.GLTF2.Loader.Extensions {
    /**
     * [Specification](https://github.com/KhronosGroup/glTF/blob/eb3e32332042e04691a5f35103f8c261e50d8f1e/extensions/2.0/Khronos/EXT_lights_image_based/README.md) (Experimental)
     */
    class EXT_lights_image_based implements IGLTFLoaderExtension {
        /** The name of this extension. */
        readonly name: string;
        /** Defines whether this extension is enabled. */
        enabled: boolean;
        private _loader;
        private _lights?;
        /** @hidden */
        constructor(loader: GLTFLoader);
        /** @hidden */
        dispose(): void;
        /** @hidden */
        onLoading(): void;
        /** @hidden */
        loadSceneAsync(context: string, scene: IScene): Nullable<Promise<void>>;
        private _loadLightAsync;
    }
}
