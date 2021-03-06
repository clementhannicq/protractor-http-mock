describe('http mock', function(){
	var http = null,
		module;

	function configureMock(){
		var mock = window.httpMock([
			{
				request: {
					method: 'GET',
					path: '/user'
				},
				response: {
					data: 'pass'
				}
			},
			{
				request: {
					method: 'GET',
					path: '/user',
					params: {
						id: 1
					}
				},
				response: {
					data: {
						name: 'Carlos Github'
					}
				}
			},
			{
				request: {
					method: 'GET',
					path: '/user/search',
					queryString: {
						id: '1',
						city: 'ny&ny'
					}
				},
				response: {
					data: {
						name: 'Carlos QS'
					}
				}
			},
			{
				request: {
					method: 'post',
					path: '/user'
				},
				response: {
					status: 200,
					data: 'Generic match'
				}
			},
			{
				request: {
					method: 'post',
					path: '/user',
					data: {
						name: 'Carlos'
					}
				},
				response: {
					data: 'Carlos has been saved'
				}
			},
			{
				request: {
					method: 'post',
					path: '/user',
					data: {
						name: 'Other name'
					}
				},
				response: {
					status: 500,
					data: {
						error: 'Cant save other users'
					}
				}
			},
			{
				request: {
					path: '/head',
					method: 'head'
				},
				response: {
					data: 'head response'
				}
			},
			{
				request: {
					path: '/delete',
					method: 'delete'
				},
				response: {
					data: 'delete response'
				}
			},
			{
				request: {
					path: '/put',
					method: 'put'
				},
				response: {
					data: 'put response'
				}
			},
			{
				request: {
					path: '/patch',
					method: 'patch'
				},
				response: {
					data: 'patch response'
				}
			},
			{
				request: {
					path: '/jsonp',
					method: 'jsonp'
				},
				response: {
					data: 'jsonp response'
				}
			},
		]);

		mock();
	}

	configureMock();

	module = angular.module('httpMock').run(function($http){
		http = $http;
	});

	describe('direct calls', function(){
		describe('get', function(){
			it('captures a simple get call', function(done){
				http({
					method: 'GET',
					url: 'test-api.com/user'
				}).then(function(response){
					expect(response.data).toBe('pass');
					done();
				});
			});

			it('captures get with provided params', function(done){
				http({
					method: 'GET',
					url: '/user',
					params: {
						id: 1
					}
				}).then(function(response){
					expect(response.data.name).toBe('Carlos Github');
					done();
				});
			});

			it('treats params get with provided params', function(done){
				http({
					method: 'GET',
					url: '/user',
					params: {
						id: 2
					}
				}).then(function(response){
					expect(response.data).toBe('pass');
					done();
				});
			});
		});

		describe('post', function(){
			it('captures post calls', function(done){
				http({
					method: 'POST',
					url: '/user',
					data: {
						name: 'Carlos'
					}
				}).then(function(response){
					expect(response.data).toBe('Carlos has been saved');
					done();
				});
			});

			it('captures expected post errors', function(done){
				http({
					method: 'POST',
					url: '/user',
					data: {
						name: 'Other name'
					}
				}).catch(function(response){
					expect(response.status).toBe(500);
					expect(response.data.error).toBe('Cant save other users');
					done();
				});
			});

			it('treats data as optional field', function(done){
				http({
					method: 'POST',
					url: '/user',
					data: {
						some: 'thing'
					}
				}).then(function(response){
					expect(response.data).toBe('Generic match');
					done();
				});
			});
		});
	});

	describe('convenience methods', function(){
		it('get', function(done){
			http.get('test-api.com/user').then(function(response){
				expect(response.data).toBe('pass');
				done();
			});
		});

		it('post', function(done){
			http.post('/user', {
				name: 'Carlos'
			}).then(function(response){
				expect(response.data).toBe('Carlos has been saved');
				done();
			});
		});

		it('head', function(done){
			http.head('/head').then(function(response){
				expect(response.data).toBe('head response');
				done();
			});
		});

		it('put', function(done){
			http.put('/put').then(function(response){
				expect(response.data).toBe('put response');
				done();
			});
		});

		it('delete', function(done){
			http.delete('/delete').then(function(response){
				expect(response.data).toBe('delete response');
				done();
			});
		});

		it('jsonp', function(done){
			http.jsonp('/jsonp').then(function(response){
				expect(response.data).toBe('jsonp response');
				done();
			});
		});
	});

	it('captures and clears requests', function(done){
		http({
			method: 'GET',
			url: 'test-api.com/user'
		});

		http.head('/head').then(function(){
			expect(module.requests.length).toBeGreaterThan(1);

			var found = false;

			module.requests.forEach(function(request){
				if(request.method === 'HEAD'){
					found = true;
					expect(request.url).toBe('/head');
				}
			});

			expect(found).toBe(true);

			module.clearRequests();
			expect(module.requests.length).toBe(0);
			done();
		});
	});

	it('matches by query string', function(done){
		http.get('github.com/user/search?id=1&city=ny%26ny').then(function(response){
			expect(response.data.name).toBe('Carlos QS');
			done();
		});
	});

	describe('$http promises', function(){
		it('handles success callback', function(done){
			http({
				method: 'GET',
				url: 'test-api.com/user'
			}).success(function(data, status){
				expect(data).toBe('pass');
				expect(status).toBe(200);
				done();
			});
		});

		it('handles error callback', function(done){
			http.post('test-api.com/user', {
				name: 'Other name'
			}).error(function(data, status){
				expect(status).toBe(500);
				expect(data.error).toBe('Cant save other users');
				done();
			});
		});
	});

	
});