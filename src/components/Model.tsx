/**
 * Enhanced PTIT_Ami Live2D Model Component
 * 
 * Features:
 * - Complete expression system (16 expressions including toggles)
 * - Full motion system (11 motion groups with hitbox responses)
 * - Advanced hitbox detection (Head, Body, Face areas)
 * - Double-click special interactions
 * - Drag and zoom with position persistence
 * - Sentiment analysis for chat responses
 * - Mobile touch support with pinch-to-zoom
 * - Automatic idle animations
 * - Mouth animation during speech
 * - Vietnamese language support
 */

import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import { useAtomValue } from 'jotai';
import { lastMessageAtom } from '~/atoms/ChatAtom';
import React, { useEffect, useRef, useCallback, memo } from 'react';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

if (typeof window !== 'undefined') (window as any).PIXI = PIXI;

const SENSITIVITY = 0.95;
const SMOOTHNESS = 1;
const RECENTER_DELAY = 1000;
const IDLE_MOTION_INTERVAL = 8000; // 8 seconds between idle motions
const EXPRESSION_DURATION = 3000; // 3 seconds for expressions

// Drag and zoom settings
const MIN_SCALE = 0.2;
const MAX_SCALE = 3.0;
const ZOOM_SPEED = 0.1;
const DRAG_THRESHOLD = 5; // pixels
const STORAGE_KEY = 'ptit-ami-model-transform';

// Interaction settings
const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds
const SPECIAL_INTERACTION_COOLDOWN = 2000; // milliseconds between special interactions

// Available expressions for PTIT_Ami model - Complete list from model3.json
const EXPRESSIONS = {
  ANGRY: 'Angry',
  BLUSH: 'Blush', 
  DEFAULT: 'Default',
  EXCITED: 'Excited',
  GLASSES_TOGGLE: 'Glasses Toggle',
  HAPPY: 'Happy',
  JACKET_TOGGLE: 'Jacket Toggle', 
  SAD: 'Sad',
  THINK_1: 'Think_1',
  THINK_2: 'Think_2',
  THA_TYM: 'Tha_Tym',
  VAY_TAY_1: 'Vay_Tay_1',
  VAY_TAY_2: 'Vay_Tay_2',
  CHONG_NANH: 'Chong_Nanh',
  CHONG_NANH2: 'Chong_Nanh2',
  WRITTING: 'Writting'
};

// Available motions for PTIT_Ami model - Complete list from model3.json
const MOTIONS = {
  IDLE: 'Idle',
  CHECKIN_1: 'Checkin1',
  CHECKIN_2: 'Checkin2', 
  CHECKIN_3: 'Checkin3',
  HEAD_NOD: 'Head_Nod',
  HEAD_SHAKE: 'Head_Shake',
  HEART: 'Heart',
  HITBOX_1: 'Hitbox1',
  HITBOX_2: 'Hitbox2',
  HITBOX_3: 'Hitbox3',
  HITBOX_4: 'Hitbox4',
  HITBOX_5: 'Hitbox5'
};

// Hitbox definitions - Non-overlapping areas with matched motions/expressions
const HITBOXES = {
  HAIR: {
    id: 'HitArea_Hair',
    bounds: { x: 0.15, y: 0, width: 0.7, height: 0.18 }, // Hair area - top 18% only
    motions: [MOTIONS.HITBOX_1, MOTIONS.HITBOX_2], // Gentle head motions for hair stroking
    expressions: [EXPRESSIONS.BLUSH, EXPRESSIONS.THA_TYM], // Shy and loving reactions
    description: 'Hair stroking - intimate interaction'
  },
  FACE: {
    id: 'HitArea_Face',
    bounds: { x: 0.25, y: 0.18, width: 0.5, height: 0.22 }, // Face area - no overlap
    motions: [MOTIONS.CHECKIN_2, MOTIONS.CHECKIN_3], // Friendly greeting motions
    expressions: [EXPRESSIONS.CHONG_NANH, EXPRESSIONS.CHONG_NANH2, EXPRESSIONS.HAPPY], // Cute expressions
    description: 'Face interaction - friendly touches'
  },
  HEAD: {
    id: 'HitArea_Head',
    bounds: { x: 0.2, y: 0.4, width: 0.6, height: 0.15 }, // Lower head area - neck/chin
    motions: [MOTIONS.HEAD_NOD, MOTIONS.HEAD_SHAKE], // Head movement responses
    expressions: [EXPRESSIONS.HAPPY, EXPRESSIONS.EXCITED], // Positive reactions
    description: 'Head pat - general head interaction'
  },
  UPPER_BODY: {
    id: 'HitArea_UpperBody',
    bounds: { x: 0.2, y: 0.55, width: 0.6, height: 0.25 }, // Upper torso area
    motions: [MOTIONS.HITBOX_3], // Upper body motion matches VAY_TAY
    expressions: [ EXPRESSIONS.HAPPY], // Wave expression matches motion
    description: 'Upper body - shoulder/chest area'
  },
  BODY: {
    id: 'HitArea_Body', 
    bounds: { x: 0.15, y: 0.8, width: 0.7, height: 0.2 }, // Lower body area only
    motions: [MOTIONS.HITBOX_4, MOTIONS.HITBOX_5, MOTIONS.HEART], // Lower body specific motions
    expressions: [], // Appropriate expressions
    description: 'Lower body - waist/hip area'
  }
};

// Motion groups - organized by body area with matching expressions
const MOTION_GROUPS = {
  GREETING: [MOTIONS.CHECKIN_1, MOTIONS.CHECKIN_2, MOTIONS.CHECKIN_3],
  IDLE_VARIATIONS: [MOTIONS.IDLE],
  REACTIONS: [MOTIONS.HEAD_NOD, MOTIONS.HEAD_SHAKE, MOTIONS.HEART],
  
  // Area-specific motion groups that match expressions
  HAIR_STROKING: [MOTIONS.HITBOX_1, MOTIONS.HITBOX_2], // Gentle motions → BLUSH, THA_TYM
  FACE_TOUCH: [MOTIONS.CHECKIN_2, MOTIONS.CHECKIN_3], // Friendly motions → CHONG_NANH
  HEAD_PAT: [MOTIONS.HEAD_NOD, MOTIONS.HEAD_SHAKE], // Head motions → HAPPY, EXCITED
  UPPER_BODY_TOUCH: [MOTIONS.HITBOX_3], // Upper body motion → VAY_TAY_1
  BODY_TOUCH: [MOTIONS.HITBOX_4, MOTIONS.HITBOX_5, MOTIONS.HEART], // Lower body → VAY_TAY_2, THA_TYM
  
  ALL_HITBOX_RESPONSES: [MOTIONS.HITBOX_1, MOTIONS.HITBOX_2, MOTIONS.HITBOX_3, MOTIONS.HITBOX_4, MOTIONS.HITBOX_5]
};

const preloadModel = () => Live2DModel.from('/model/PTIT_Ami/ptit_sdk.model3.json');

const Model: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMessage = useAtomValue(lastMessageAtom);
  const modelRef = useRef<any>(null);
  const appRef = useRef<Application | null>(null);
  const mouseMoveRef = useRef({ last: 0, target: { x: 0, y: 0 }, current: { x: 0, y: 0 } });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expressionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Drag and zoom states
  const dragStateRef = useRef({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    modelStartPos: { x: 0, y: 0 },
    hasMoved: false
  });
  const modelTransformRef = useRef({
    scale: 1,
    position: { x: 0, y: 0 },
    baseScale: 1
  });

  const loadModelTransform = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { scale, position } = JSON.parse(saved);
          modelTransformRef.current.scale = scale || 1;
          if (position) {
            modelTransformRef.current.position = position;
          }
          return true;
        }
      } catch (error) {
        console.warn('Failed to load model transform from localStorage:', error);
      }
    }
    return false;
  }, []);

  const updateModelSize = useCallback(() => {
    const model = modelRef.current;
    const app = appRef.current;
    if (model && app) {
      const baseScale = Math.min(app.screen.width / model.width, app.screen.height / model.height);
      modelTransformRef.current.baseScale = baseScale;
      
      // Apply current transform
      const finalScale = baseScale * modelTransformRef.current.scale;
      model.scale.set(finalScale);
      
      // Load saved transform or use default
      const hasLoadedTransform = loadModelTransform();
      if (!hasLoadedTransform || (modelTransformRef.current.position.x === 0 && modelTransformRef.current.position.y === 0)) {
        modelTransformRef.current.position = { x: app.screen.width / 2, y: app.screen.height * 0.85 };
      }
      model.position.set(modelTransformRef.current.position.x, modelTransformRef.current.position.y);
    }
  }, [loadModelTransform]);

  const saveModelTransform = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          scale: modelTransformRef.current.scale,
          position: modelTransformRef.current.position
        }));
      } catch (error) {
        console.warn('Failed to save model transform to localStorage:', error);
      }
    }
  }, []);

  const updateModelTransform = useCallback(() => {
    const model = modelRef.current;
    if (model) {
      const finalScale = modelTransformRef.current.baseScale * modelTransformRef.current.scale;
      model.scale.set(finalScale);
      model.position.set(modelTransformRef.current.position.x, modelTransformRef.current.position.y);
      
      // Save to localStorage with debouncing
      saveModelTransform();
    }
  }, [saveModelTransform]);

  const setExpression = useCallback((expressionName: string, duration: number = EXPRESSION_DURATION) => {
    const model = modelRef.current;
    if (model && model.internalModel) {
      // Clear previous expression timer
      if (expressionTimerRef.current) {
        clearTimeout(expressionTimerRef.current);
      }
      
      // Set new expression
      model.expression(expressionName);
      
      // Reset to default after duration
      expressionTimerRef.current = setTimeout(() => {
        if (model && model.internalModel) {
          model.expression(EXPRESSIONS.DEFAULT);
        }
      }, duration);
    }
  }, []);

  const playMotion = useCallback((motionGroup: string, motionIndex: number = 0) => {
    const model = modelRef.current;
    if (model && model.internalModel) {
      model.motion(motionGroup, motionIndex);
    }
  }, []);

  const playRandomIdleMotion = useCallback(() => {
    const idleMotions = MOTION_GROUPS.IDLE_VARIATIONS;
    const randomMotion = idleMotions[Math.floor(Math.random() * idleMotions.length)];
    if (randomMotion) {
      playMotion(randomMotion, Math.floor(Math.random() * 3)); // PTIT_Ami has 3 idle motion variations
    }
  }, [playMotion]);

  // Enhanced hitbox detection - non-overlapping areas
  const detectHitbox = useCallback((x: number, y: number) => {
    // Check each hitbox area (x, y are normalized coordinates 0-1)
    // Ordered from top to bottom for logical interaction flow
    const hitboxOrder = ['HAIR', 'FACE', 'HEAD', 'UPPER_BODY', 'BODY'];
    
    for (const key of hitboxOrder) {
      const hitbox = HITBOXES[key as keyof typeof HITBOXES];
      if (hitbox) {
        const { bounds } = hitbox;
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          console.log(`🎯 Hitbox: ${key} - ${hitbox.description}`);
          return { area: key, hitbox };
        }
      }
    }
    console.log('❌ No hitbox at coordinates:', { x: x.toFixed(2), y: y.toFixed(2) });
    return null;
  }, []);

  // Play random motion from a group
  const playRandomMotionFromGroup = useCallback((motions: string[]): string | null => {
    if (motions.length > 0) {
      const randomMotion = motions[Math.floor(Math.random() * motions.length)];
      if (randomMotion) {
        playMotion(randomMotion);
        return randomMotion;
      }
    }
    return null;
  }, [playMotion]);

  // Play random expression from a group  
  const playRandomExpressionFromGroup = useCallback((expressions: string[]): string | null => {
    if (expressions.length > 0) {
      const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
      if (randomExpression) {
        setExpression(randomExpression);
        return randomExpression;
      }
    }
    return null;
  }, [setExpression]);

  // Handle hitbox interactions with appropriate motions and expressions
  const handleHitboxInteraction = useCallback((hitboxData: { area: string, hitbox: typeof HITBOXES[keyof typeof HITBOXES] }) => {
    const { area, hitbox } = hitboxData;
    
    // Play appropriate motion for the hitbox area
    const playedMotion = playRandomMotionFromGroup(hitbox.motions);
    
    // Set appropriate expression for the hitbox area
    const playedExpression = playRandomExpressionFromGroup(hitbox.expressions);
    
    console.log(`Hitbox interaction: ${area}, Motion: ${playedMotion || 'none'}, Expression: ${playedExpression || 'none'}`);
    
    return { motion: playedMotion, expression: playedExpression };
  }, [playRandomMotionFromGroup, playRandomExpressionFromGroup]);

  const analyzeMessageSentiment = useCallback((message: string): string => {
    const happyWords = ['happy', 'good', 'great', 'awesome', 'wonderful', 'excellent', 'vui', 'tốt', 'tuyệt', 'hay', 'giỏi', 'đẹp'];
    const sadWords = ['sad', 'bad', 'terrible', 'awful', 'buồn', 'tệ', 'khủng khiếp', 'không tốt', 'thất vọng'];
    const excitedWords = ['amazing', 'incredible', 'wow', 'fantastic', 'tuyệt vời', 'thú vị', 'hứng thú', 'tuyệt cú mèo', 'quá đỉnh'];
    const angryWords = ['angry', 'mad', 'furious', 'annoyed', 'giận', 'tức', 'bực', 'khó chịu'];
    const loveWords = ['love', 'heart', 'cute', 'adorable', 'yêu', 'thương', 'dễ thương', 'đáng yêu', '❤️', '💕', '💖'];
    
    const lowerMessage = message.toLowerCase();
    
    if (loveWords.some(word => lowerMessage.includes(word))) return EXPRESSIONS.THA_TYM;
    if (angryWords.some(word => lowerMessage.includes(word))) return EXPRESSIONS.ANGRY;
    if (excitedWords.some(word => lowerMessage.includes(word))) return EXPRESSIONS.EXCITED;
    if (happyWords.some(word => lowerMessage.includes(word))) return EXPRESSIONS.HAPPY;
    if (sadWords.some(word => lowerMessage.includes(word))) return EXPRESSIONS.SAD;
    
    return EXPRESSIONS.DEFAULT;
  }, []);

  const animateModel = useCallback((deltaTime: number) => {
    const model = modelRef.current;
    if (model) {
      const now = Date.now();
      const factor = Math.max(0, Math.min((now - mouseMoveRef.current.last - RECENTER_DELAY) / 1000, 1));
      const easeFactor = Math.sin(Math.PI * factor / 2);
      mouseMoveRef.current.current.x += (mouseMoveRef.current.target.x * (1 - easeFactor) - mouseMoveRef.current.current.x) * SMOOTHNESS * deltaTime;
      mouseMoveRef.current.current.y += (mouseMoveRef.current.target.y * (1 - easeFactor) - mouseMoveRef.current.current.y) * SMOOTHNESS * deltaTime;
      model.internalModel.focusController?.focus(mouseMoveRef.current.current.x, mouseMoveRef.current.current.y);
    }
  }, []);

  const renderLoop = useCallback((deltaTime: number) => {
    animateModel(deltaTime);
  }, [animateModel]);

  useEffect(() => {
    (async () => {
      const app = new Application({
        view: canvasRef.current!,
        backgroundAlpha: 0,
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      appRef.current = app;

      try {
        modelRef.current = await preloadModel();
        app.stage.addChild(modelRef.current);
        modelRef.current.anchor.set(0.5, 0.78);
        updateModelSize();

        // Set initial expression
        setExpression(EXPRESSIONS.DEFAULT);

        // Start idle motion timer
        const startIdleTimer = () => {
          idleTimerRef.current = setInterval(() => {
            playRandomIdleMotion();
          }, IDLE_MOTION_INTERVAL);
        };
        startIdleTimer();

        const handleMouseDown = (event: MouseEvent) => {
          const rect = appRef.current?.view.getBoundingClientRect();
          if (rect && modelRef.current) {
            const { clientX, clientY } = event;
            dragStateRef.current = {
              isDragging: true,
              startPos: { x: clientX, y: clientY },
              modelStartPos: { ...modelTransformRef.current.position },
              hasMoved: false
            };
            event.preventDefault();
            event.stopPropagation();
          }
        };

        const handleMouseMove = (event: MouseEvent) => {
          const rect = appRef.current?.view.getBoundingClientRect();
          if (rect) {
            const { clientX, clientY } = event;
            
            // Handle dragging
            if (dragStateRef.current.isDragging) {
              const deltaX = clientX - dragStateRef.current.startPos.x;
              const deltaY = clientY - dragStateRef.current.startPos.y;
              
              // Check if moved beyond threshold
              if (!dragStateRef.current.hasMoved && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
                dragStateRef.current.hasMoved = true;
              }
              
              if (dragStateRef.current.hasMoved) {
                modelTransformRef.current.position = {
                  x: dragStateRef.current.modelStartPos.x + deltaX,
                  y: dragStateRef.current.modelStartPos.y + deltaY
                };
                updateModelTransform();
              }
            } else {
              // Handle eye tracking when not dragging
            mouseMoveRef.current.target = {
              x: ((clientX - rect.left) / rect.width - 0.5) * 2 * SENSITIVITY,
              y: -(((clientY - rect.top) / rect.height - 0.5) * 2 * SENSITIVITY),
            };
            mouseMoveRef.current.last = Date.now();
            }
          }
        };

        const handleMouseUp = (event: MouseEvent) => {
          if (dragStateRef.current.isDragging && !dragStateRef.current.hasMoved) {
            // Handle click only if didn't drag
            const rect = appRef.current?.view.getBoundingClientRect();
            if (rect && modelRef.current) {
              const { clientX, clientY } = event;
              const x = (clientX - rect.left) / rect.width;
              const y = (clientY - rect.top) / rect.height;
              
              // Use enhanced hitbox detection system
              const hitboxData = detectHitbox(x, y);
              if (hitboxData) {
                handleHitboxInteraction(hitboxData);
              } else {
                // Fallback to general interaction if no specific hitbox
                playRandomMotionFromGroup(MOTION_GROUPS.REACTIONS);
                setExpression(EXPRESSIONS.HAPPY);
              }
            }
          }
          
          dragStateRef.current.isDragging = false;
          dragStateRef.current.hasMoved = false;
        };

        const handleWheel = (event: WheelEvent) => {
          event.preventDefault();
          const delta = event.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
          const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, modelTransformRef.current.scale + delta));
          
          if (newScale !== modelTransformRef.current.scale) {
            modelTransformRef.current.scale = newScale;
            updateModelTransform();
          }
        };

        // Touch event handlers for mobile support
        const handleTouchStart = (event: TouchEvent) => {
          if (event.touches.length === 1) {
            const touch = event.touches[0];
            if (touch) {
              handleMouseDown({ 
                clientX: touch.clientX, 
                clientY: touch.clientY, 
                preventDefault: () => event.preventDefault(),
                stopPropagation: () => event.stopPropagation()
              } as any);
            }
          }
        };

        const handleTouchMove = (event: TouchEvent) => {
          if (event.touches.length === 1) {
            const touch = event.touches[0];
            if (touch) {
              handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as any);
            }
          }
        };

        const handleTouchEnd = (event: TouchEvent) => {
          if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            if (touch) {
              handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY } as any);
            }
          }
        };

        // Double-click/tap handler for special interactions
        let lastTapTime = 0;
        let lastSpecialInteraction = 0;
        const handleDoubleClick = (event: MouseEvent) => {
          const currentTime = Date.now();
          const timeDiff = currentTime - lastTapTime;
          
          if (timeDiff < DOUBLE_CLICK_THRESHOLD && (currentTime - lastSpecialInteraction) > SPECIAL_INTERACTION_COOLDOWN) {
            const rect = appRef.current?.view.getBoundingClientRect();
            if (rect && modelRef.current) {
              const { clientX, clientY } = event;
              const x = (clientX - rect.left) / rect.width;
              const y = (clientY - rect.top) / rect.height;
              
              const hitboxData = detectHitbox(x, y);
              // Handle different hitbox areas with matched motions and expressions
              switch (hitboxData?.area) {
                case 'HAIR':
                  console.log('🥰 Hair stroking - intimate interaction!');
                  setExpression(EXPRESSIONS.BLUSH);
                  playRandomMotionFromGroup(MOTION_GROUPS.HAIR_STROKING);
                  setTimeout(() => setExpression(EXPRESSIONS.THA_TYM), 1500);
                  break;
                  
                case 'FACE':
                  console.log('😊 Face touch - friendly interaction!');
                  setExpression(EXPRESSIONS.CHONG_NANH);
                  playRandomMotionFromGroup(MOTION_GROUPS.FACE_TOUCH);
                  break;
                  
                case 'HEAD':
                  console.log('😄 Head pat - affectionate interaction!');
                  setExpression(EXPRESSIONS.HAPPY);
                  playRandomMotionFromGroup(MOTION_GROUPS.HEAD_PAT);
                  break;
                  
                case 'UPPER_BODY':
                  console.log('👋 Upper body touch - playful interaction!');
                  setExpression(EXPRESSIONS.HAPPY); // Wave expression matches motion
                  playRandomMotionFromGroup(MOTION_GROUPS.UPPER_BODY_TOUCH);
                  break;
                  
                case 'BODY':
                  console.log('💖 Body touch - special interaction!');
                  setExpression(EXPRESSIONS.ANGRY);
                  playRandomMotionFromGroup(MOTION_GROUPS.BODY_TOUCH);
                  setTimeout(() => setExpression(EXPRESSIONS.THA_TYM), 1000);
                  break;
                  
                default:
                  console.log('❤️ General interaction!');
                  setExpression(EXPRESSIONS.HAPPY);
                  playMotion(MOTIONS.HEART);
                  break;
              }
              lastSpecialInteraction = currentTime;
            }
          }
          
          lastTapTime = currentTime;
        };


        // Pinch to zoom for mobile
        let lastPinchDistance = 0;
        const handleTouchStartPinch = (event: TouchEvent) => {
          if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            if (touch1 && touch2) {
              lastPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
              );
            }
          }
        };

        const handleTouchMovePinch = (event: TouchEvent) => {
          if (event.touches.length === 2) {
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            if (touch1 && touch2) {
              const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
              );
              
              if (lastPinchDistance > 0) {
                const delta = (currentDistance - lastPinchDistance) * 0.01;
                const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, modelTransformRef.current.scale + delta));
                
                if (newScale !== modelTransformRef.current.scale) {
                  modelTransformRef.current.scale = newScale;
                  updateModelTransform();
                }
              }
              
              lastPinchDistance = currentDistance;
            }
          }
        };

        // Mouse events - only on canvas
        if (canvasRef.current) {
          canvasRef.current.addEventListener('mousedown', handleMouseDown);
          canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });
          canvasRef.current.addEventListener('click', handleDoubleClick);
        }
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseup', handleMouseUp);
        
        // Touch events - only on canvas
        if (canvasRef.current) {
          canvasRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
          canvasRef.current.addEventListener('touchstart', handleTouchStartPinch, { passive: true });
          canvasRef.current.addEventListener('touchmove', handleTouchMovePinch, { passive: false });
        }
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        app.ticker.add(renderLoop);

        const handleResize = () => {
          app.renderer.resize(window.innerWidth, window.innerHeight);
          updateModelSize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          // Remove mouse events
          if (canvasRef.current) {
            canvasRef.current.removeEventListener('mousedown', handleMouseDown);
            canvasRef.current.removeEventListener('wheel', handleWheel);
            canvasRef.current.removeEventListener('click', handleDoubleClick);
            canvasRef.current.removeEventListener('touchstart', handleTouchStart);
            canvasRef.current.removeEventListener('touchstart', handleTouchStartPinch);
            canvasRef.current.removeEventListener('touchmove', handleTouchMovePinch);
          }
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchmove', handleTouchMove);
          window.removeEventListener('touchend', handleTouchEnd);
          window.removeEventListener('resize', handleResize);
          
          // Clear timers
          if (idleTimerRef.current) {
            clearInterval(idleTimerRef.current);
          }
          if (expressionTimerRef.current) {
            clearTimeout(expressionTimerRef.current);
          }
          
          app.ticker.remove(renderLoop);
          app.destroy(true, { children: true, texture: true, baseTexture: true });
        };
      } catch (error) {
        console.error('Error setting up Pixi.js application:', error);
      }
    })();
  }, [renderLoop, updateModelSize, updateModelTransform, setExpression, playRandomIdleMotion, playMotion, loadModelTransform, detectHitbox, handleHitboxInteraction, playRandomMotionFromGroup, playRandomExpressionFromGroup]);

  useEffect(() => {
    if (lastMessage && modelRef.current) {
      if (lastMessage.role === 'assistant') {
        // Analyze sentiment and set appropriate expression
        const expression = analyzeMessageSentiment(lastMessage.content);
        setExpression(expression);
        
        // Play writing motion for assistant messages
        setExpression(EXPRESSIONS.WRITTING);
        playMotion(MOTIONS.IDLE, 0); // Use idle motion while writing
        
        // Animate mouth for speech
      const duration = lastMessage.content.length * 55;
      const startTime = performance.now();
      const animate = (time: number) => {
        const elapsedMS = time - startTime;
          if (modelRef.current?.internalModel?.coreModel) {
        modelRef.current.internalModel.coreModel.setParameterValueById('ParamMouthOpenY',
          elapsedMS < duration ? Math.sin(elapsedMS / 100) * 0.5 + 0.5 : 0);
          }
        if (elapsedMS < duration) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      } else if (lastMessage.role === 'user') {
        // React to user messages
        const expression = analyzeMessageSentiment(lastMessage.content);
        setExpression(expression);
        
        // Play thinking motion for user messages
        const thinkingExpressions = [EXPRESSIONS.THINK_1, EXPRESSIONS.THINK_2];
        const randomThinking = thinkingExpressions[Math.floor(Math.random() * thinkingExpressions.length)];
        if (randomThinking) {
          setExpression(randomThinking, 2000);
        }
        
        // Add greeting motions for user messages
        if (lastMessage.content.toLowerCase().includes('hello') || 
            lastMessage.content.toLowerCase().includes('hi') ||
            lastMessage.content.toLowerCase().includes('xin chào') ||
            lastMessage.content.toLowerCase().includes('chào')) {
          playRandomMotionFromGroup(MOTION_GROUPS.GREETING);
          setExpression(EXPRESSIONS.HAPPY);
        }
        
        // Play head nod to acknowledge
        setTimeout(() => {
          playMotion(MOTIONS.HEAD_NOD);
        }, 1000);
      }
    }
  }, [lastMessage, analyzeMessageSentiment, setExpression, playMotion]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
});

export default Model;