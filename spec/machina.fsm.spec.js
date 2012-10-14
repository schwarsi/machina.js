QUnit.specify( "machina.js", function () {
	var fsm;
	describe( "machina.Fsm", function () {
		describe( "When creating a new Fsm", function () {
			var event1 = 0,
				event2 = 0,
				event3 = 0,
				noHandlerInvoked = false,
				transitionedHandler = false,
				handlingHandler = false,
				handledHandler = false,
				invalidStateHandler = false,
				customEventInvoked = false,
				onEnterInvoked = false,
				xfsm = new machina.Fsm( {
					states : {
						"uninitialized" : {
							"event1" : function () {
								event1++;
								this.fireEvent( "CustomEvent" );
								this.transition( "initialized" );
							}
						},
						"initialized" : {
							_onEnter : function () {
								onEnterInvoked = true;
							},
							"event2" : function () {
								event2++;
							},
							"event3" : function () {
								event3++;
							}
						}
					},
					eventListeners : {
						"nohandler" : [function () {
							noHandlerInvoked = true;
						}],
						"transition" : [function () {
							transitionedHandler = true;
						}],
						"handling" : [function () {
							handlingHandler = true;
						}],
						"handled" : [function () {
							handledHandler = true;
						}],
						"invalidstate" : [function () {
							invalidStateHandler = true;
						}],
						"CustomEvent" : [function () {
							customEventInvoked = true;
						}]
					}
				} );
			xfsm.handle( "nothingwillgetthis" );
			xfsm.handle( "event1" );
			xfsm.handle( "event2" );
			xfsm.handle( "event3" );
			xfsm.transition( "NoSuchState" );

			it( "should fire the transition event", function () {
				assert( transitionedHandler ).equals( true );
			} );
			it( "should fire the nohandler event", function () {
				assert( noHandlerInvoked ).equals( true );
			} );
			it( "should fire the handling event", function () {
				assert( handlingHandler ).equals( true );
			} );
			it( "should fire the handled event", function () {
				assert( handledHandler ).equals( true );
			} );
			it( "should fire the CustomEvent event", function () {
				assert( customEventInvoked ).equals( true );
			} );
			it( "should fire the OnEnter handler", function () {
				assert( onEnterInvoked ).equals( true );
			} );
			it( "should fire the invalidstate handler", function () {
				assert( invalidStateHandler ).equals( true );
			} );
			it( "should have invoked handlers", function () {
				assert( event1 ).equals( true );
				assert( event2 ).equals( true );
				assert( event3 ).equals( true );
			} );
		} );

		describe( "When deferring until after the next transition", function () {
			var event2 = 0,
				deferredInvoked = false,
				xfsm = new machina.Fsm( {
					states : {
						"uninitialized" : {
							"event1" : function () {
								this.transition( "initialized" );
							},
							"event2" : function () {
								this.deferUntilTransition();
							}
						},
						"initialized" : {
							"event2" : function () {
								event2++;
							}
						}
					},
					eventListeners : {
						"deferred" : [function () {
							deferredInvoked = true;
						}]
					}
				} );
			xfsm.handle( "event2" );
			xfsm.handle( "event1" );

			it( "should fire the Deferred event", function () {
				assert( deferredInvoked ).equals( true );
			} );
			it( "should have invoked the handler on replay", function () {
				assert( event2 ).equals( 1 );
			} );
		} );

		describe( "When deferring until a specific state", function () {
			var event2 = 0,
				deferredInvoked = false,
				xfsm = new machina.Fsm( {
					states : {
						"uninitialized" : {
							"event1" : function () {
								this.transition( "initialized" );
							},
							"event2" : function () {
								this.deferUntilTransition( "ready" );
							}
						},
						"initialized" : {
							"event1" : function () {
								this.transition( "ready" );
							},
							"event2" : function () {
								event2++;
							}
						},
						"ready" : {
							"event2" : function () {
								event2++;
							}
						}
					},
					eventListeners : {
						"deferred" : [function () {
							deferredInvoked = true;
						}]
					}
				} );
			xfsm.handle( "event2" );
			xfsm.handle( "event1" );
			xfsm.handle( "event1" );

			it( "should fire the Deferred event", function () {
				assert( deferredInvoked ).equals( true );
			} );
			it( "should have invoked the handler once in 'ready' state", function () {
				assert( event2 ).equals( 1 );
			} );
		} );

		describe( "When deferring until the next handler call", function () {
			var event2 = 0,
				deferredInvoked = false,
				xfsm = new machina.Fsm( {
					states : {
						"uninitialized" : {
							"event1" : function () {
								this.transition( "initialized" );
							},
							"event2" : function () {
								this.deferUntilNextHandler();
							}
						},
						"initialized" : {
							"event1" : function () {
								this.transition( "ready" );
							},
							"event2" : function () {
								event2++;
							}
						},
						"ready" : {
							"event2" : function () {
								event2++;
							}
						}
					},
					eventListeners : {
						"deferred" : [function () {
							deferredInvoked = true;
						}]
					}
				} );
			xfsm.handle( "event2" );
			xfsm.handle( "event1" );
			xfsm.handle( "event1" );

			it( "should fire the Deferred event", function () {
				assert( deferredInvoked ).equals( true );
			} );
			it( "should have invoked the handler once", function () {
				assert( event2 ).equals( 1 );
			} );
		} );

		describe( "When transitioning to new states from an entry action", function () {
			var booCount = 0;
			var haiCount = 0;
			var fsm = new machina.Fsm( {
				initialState : "notstarted",
				states : {
					notstarted : {
						"start" : function () {
							this.transition( "one" );
						},
						"*" : function () {
							this.deferUntilTransition();
						}
					},
					one : {
						_onEnter : function () {
							this.transition( "two" );
						},
						"hai" : function () {
							haiCount++;
						},
						"boo" : function () {
							booCount++;
						}
					},
					two : {
						_onEnter : function () {
							this.transition( "three" );
						},
						"hai" : function () {
							haiCount++;
						},
						"boo" : function () {
							booCount++;
						}
					},

					three : {
						"hai" : function () {
							haiCount++;
						},
						"boo" : function () {
							booCount++;
						}
					}
				}
			} );

			fsm.handle( "boo" );
			fsm.handle( "hai" );
			fsm.handle( "start" );

			it( "should only fire the boo and hai events once", function () {
				assert( booCount ).equals( 1 );
				assert( haiCount ).equals( 1 );
			} );
		} );

		describe( "When creating an instance from an extended constructor function", function(){
			var SomeFsm = machina.Fsm.extend({
				initialState: "notStarted",
				states: {
					"notStarted" :{
						start : function() {
							this.transition("started");
						}
					},
					"started" : {
						finish : function() {
							this.transition("finished");
						}
					},
					"finished" : {
						_onEnter: function() {

						}
					}
				}
			});
			window.FSM = SomeFsm;
			window.ALT = SomeFsm.extend({
				states: {
					"gotcha" : {
						hai: function() {}
					}
				},
        namespace: "Alt.namespace"
			});
			var fsm = new SomeFsm();
			window.fsm = fsm;
			it( "should produce an FSM instance", function() {
				assert( typeof fsm.transition ).equals('function');
				assert( typeof fsm.processQueue ).equals('function');
				assert( typeof fsm.trigger ).equals('function');
				assert( typeof fsm.emit ).equals('function');
				assert( typeof fsm.on ).equals('function');
				assert( typeof fsm.off ).equals('function');
				assert( typeof fsm.states ).equals('object');
				assert( typeof fsm.states.notStarted ).equals('object');
				assert( typeof fsm.states.started ).equals('object');
				assert( typeof fsm.states.finished ).equals('object');
			});
		});
	} );
} );