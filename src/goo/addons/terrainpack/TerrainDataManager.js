define([
	'goo/addons/terrainpack/Terrain',
	'goo/addons/terrainpack/Vegetation',
	'goo/addons/terrainpack/Forest',
	'goo/math/Vector3',
	'goo/util/Ajax',
	'goo/math/Transform',
	'goo/math/MathUtils',
	'goo/renderer/Texture',
	'goo/renderer/TextureCreator',
	'goo/util/rsvp'
],
	function(
		Terrain,
		Vegetation,
		Forest,
		Vector3,
		Ajax,
		Transform,
		MathUtils,
		Texture,
		TextureCreator,
		RSVP
		) {
		'use strict';

		function TerrainDataManager() {

		}


		TerrainDataManager.prototype.setResourceFolder = function (folder) {
			this.resourceFolder = folder;
		};


		TerrainDataManager.prototype._loadData = function (url) {
			var promise = new RSVP.Promise();

			var fromLocalStore = localStorage.getItem(url)
			if (fromLocalStore) {

				setTimeout(function() {

					function _base64ToArrayBuffer(string_base64)    {
						var binary_string =  window.atob(string_base64);
						var len = binary_string.length;
						var bytes = new Uint8Array( len );
						for (var i = 0; i < len; i++)        {
							var ascii = binary_string.charCodeAt(i);
							bytes[i] = ascii;
						}
						return bytes.buffer;
					}
					var parsed = JSON.parse(fromLocalStore)
					var data = _base64ToArrayBuffer(parsed.data)
					console.log("Loading Local Data: ", parsed.file);

					promise.resolve(data);
				}, 0);

			} else {
				var ajax = new Ajax();
				ajax.get({
					url: this.resourceFolder + url,
					responseType: 'arraybuffer'
				}).then(function(request) {
					promise.resolve(request.response);
				}.bind(this), function(err) {
					promise.resolve(null);
				}.bind(this));
			}

			return promise;
		};

		TerrainDataManager.prototype._textureLoad = function (url) {
			var promise = new RSVP.Promise();
			new TextureCreator().loadTexture2D(url, {
				anisotropy: 4
			}, function (texture) {
				promise.resolve(texture);
			});
			return promise;
		};

		TerrainDataManager.prototype._loadTextures = function (folder, terrainData, callback) {
			var promises = [];
			promises.push(this._textureLoad(folder + terrainData.ground1.texture));
			promises.push(this._textureLoad(folder + terrainData.ground2.texture));
			promises.push(this._textureLoad(folder + terrainData.ground3.texture));
			promises.push(this._textureLoad(folder + terrainData.ground4.texture));
			promises.push(this._textureLoad(folder + terrainData.ground5.texture));
			promises.push(this._textureLoad(folder + terrainData.stone.texture));
			return RSVP.all(promises).then(function (textures) {
				callback(textures);
			})
		};

		return TerrainDataManager;
	});