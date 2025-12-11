# Uint32Array vs Uint8ClampedArray 비교 분석

## 배경

ADR 001 문서에서 픽셀 상태 저장에 `Uint32Array`를 사용하도록 제안하고 있는데, HTML Canvas API의 `ImageData`는 `Uint8ClampedArray`를 사용한다. 두 자료형 중 어떤 것이 더 적합한지 검토한다.

## 기본 구조 차이

| 특성 | Uint8ClampedArray | Uint32Array |
|------|-------------------|-------------|
| 요소 크기 | 1바이트 (8비트) | 4바이트 (32비트) |
| 픽셀당 요소 수 | 4개 (R, G, B, A) | 1개 (RGBA 통합) |
| 픽셀당 총 메모리 | 4바이트 | 4바이트 (동일) |
| 픽셀 접근 방식 | `data[i*4]`, `data[i*4+1]`, ... | `data[i]` |

### 메모리 구조 시각화

```text
동일한 빨간색 픽셀 (R:255, G:0, B:0, A:255)

Uint8ClampedArray (요소 4개):
┌─────────┬─────────┬─────────┬─────────┐
│ [0]=255 │ [1]=0   │ [2]=0   │ [3]=255 │
│  1byte  │  1byte  │  1byte  │  1byte  │
└─────────┴─────────┴─────────┴─────────┘
     R         G         B         A

Uint32Array (요소 1개):
┌─────────────────────────────────────────┐
│           [0] = 0xFF0000FF              │
│               4bytes                     │
└─────────────────────────────────────────┘
            ABGR (Little Endian)
```

## 성능 차이 발생 원인

메모리 크기는 동일하지만, **CPU가 메모리에 접근하고 연산하는 방식**에서 차이가 발생한다.

### 메모리 접근 패턴

```javascript
// 100x100 캔버스에서 (50, 50) 위치의 픽셀을 빨간색으로 설정
const index = 50 * 100 + 50; // = 5050

// Uint8ClampedArray: 4번의 메모리 접근
data[index * 4]     = 255;  // R
data[index * 4 + 1] = 0;    // G
data[index * 4 + 2] = 0;    // B
data[index * 4 + 3] = 255;  // A

// Uint32Array: 1번의 메모리 접근
data[index] = 0xFF0000FF;   // ABGR
```

### CPU 관점에서의 차이

| 작업 | Uint8ClampedArray | Uint32Array |
|------|-------------------|-------------|
| 인덱스 계산 | `i * 4`, `i * 4 + 1`, ... (4번) | `i` (1번) |
| 메모리 쓰기 | 8비트씩 4번 | 32비트 1번 |
| 총 명령어 수 | 많음 | 적음 |

배열의 각 요소에 접근할 때마다 CPU는 메모리 주소를 계산하고 해당 위치의 데이터를 읽거나 써야 한다. **요소 접근 횟수가 4배 차이**나기 때문에 성능 차이가 발생한다.

### 비교 연산의 차이

```javascript
// 두 픽셀이 같은 색인지 비교

// Uint8ClampedArray: 4번 비교
if (data[i*4] === data[j*4] && 
    data[i*4+1] === data[j*4+1] && 
    data[i*4+2] === data[j*4+2] && 
    data[i*4+3] === data[j*4+3]) { ... }

// Uint32Array: 1번 비교
if (pixels[i] === pixels[j]) { ... }
```

## Canvas API와의 관계

```javascript
// Canvas ImageData는 Uint8ClampedArray 사용
const imageData = ctx.getImageData(0, 0, width, height);
console.log(imageData.data instanceof Uint8ClampedArray); // true

// 동일한 ArrayBuffer를 공유하여 Uint32Array view 생성 가능
const uint32View = new Uint32Array(imageData.data.buffer);
```

## ADR 컨텍스트에서의 분석

### Uint32Array 사용이 적합한 이유

1. **성능 최적화**: 픽셀 단위 읽기/쓰기가 빈번한 픽셀 에디터에서 성능 이점
2. **플랫폼 독립성**: Core에서 `Uint32Array`로 상태를 관리하면 Canvas API에 종속되지 않음
3. **코드 간결성**: 픽셀 비교/복사가 단순화됨
4. **알고리즘 구현 용이**: Fill, Undo/Redo 등에서 상태 스냅샷 저장/복원이 단순화됨

### 고려해야 할 단점

1. **엔디안(Endianness) 문제**

   ```javascript
   // 시스템에 따라 바이트 순서가 다름
   // Little Endian (대부분): ABGR 순서로 저장
   // Big Endian: RGBA 순서로 저장
   
   // 해결책: 런타임에 엔디안 감지
   const isLittleEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;
   ```

2. **Canvas 렌더링 시 변환 필요**

   ```javascript
   // ArrayBuffer 공유 (권장 - 복사 없음)
   const buffer = new ArrayBuffer(width * height * 4);
   const uint32View = new Uint32Array(buffer);  // Core 상태
   const uint8View = new Uint8ClampedArray(buffer);  // Canvas용 view
   
   // Core에서 uint32View 수정 후
   const imageData = new ImageData(uint8View, width, height);
   ctx.putImageData(imageData, 0, 0);
   ```

## 권장 구조

```typescript
// dotorixel-core
class PixelState {
  private buffer: ArrayBuffer;
  private pixels: Uint32Array;  // Core 내부 상태
  
  // Renderer에 ArrayBuffer 제공 (view 공유용)
  getBuffer(): ArrayBuffer {
    return this.buffer;
  }
}

// dotorixel-react (Canvas Renderer)
class CanvasRenderer {
  private uint8View: Uint8ClampedArray;  // Canvas 렌더링용 view
  
  constructor(coreBuffer: ArrayBuffer) {
    // 동일한 버퍼를 Uint8ClampedArray로 view
    this.uint8View = new Uint8ClampedArray(coreBuffer);
  }
}
```

## 결론

| 기준 | 승자 | 이유 |
|------|------|------|
| 성능 | Uint32Array | 단일 연산으로 픽셀 처리 |
| 플랫폼 독립성 | Uint32Array | Canvas API에 비종속적 |
| Canvas 호환성 | Uint8ClampedArray | 직접 사용 가능 |
| 알고리즘 구현 | Uint32Array | 픽셀 비교/복사 단순화 |

**최종 결정**: ADR 문서의 `Uint32Array` 선택이 적절하다. ArrayBuffer 공유 패턴을 사용하면 Canvas 호환성 문제도 해결되며, Core의 플랫폼 독립성을 유지하면서 성능상의 이점을 얻을 수 있다.
