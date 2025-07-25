# Noumenon Gleaner - Schema Generation Process

## 개요

Noumenon Gleaner는 CSV 파일에서 스키마를 자동으로 생성하는 도구입니다. 게임 데이터나 복잡한 구조화된 데이터를 다룰 때, 각 CSV 파일의 구조를 분석하고 타입 정보를 추출하여 체계적인 스키마 맵을 생성합니다.

## 주요 기능

- **자동 타입 추론**: 기본 타입(int32, str, bool 등)을 자동으로 인식
- **재귀적 스키마 생성**: 커스텀 타입이 다른 CSV 파일을 참조하는 경우 재귀적으로 처리
- **순환 의존성 감지**: 무한 루프를 방지하는 안전장치
- **에러 처리**: 누락된 파일에 대한 구체적인 제안 제공

## CSV 파일 형식

Noumenon Gleaner는 EXD data의 CSV 파일을 처리합니다:

```csv
key,0,1,2,3,...                       # 1행: key + 숫자 인덱스
#,FieldName1,FieldName2,FieldName3... # 2행: 필드 이름 (# 접두사)
int32,str,CustomType,bool,...         # 3행: 필드 타입
0,"Sample",1,true,...                 # 4행부터: 실제 데이터
```

### 실제 예시: Item.csv (일부)

```csv
key,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90
#,Singular,Adjective,Plural,PossessivePronoun,StartsWithVowel,,Pronoun,Article,Description,Name,Icon,Level{Item},Rarity,FilterGroup,AdditionalData,ItemUICategory,ItemSearchCategory,EquipSlotCategory,ItemSortCategory,,StackSize,IsUnique,IsUntradable,IsIndisposable,Lot,Price{Mid},Price{Low},CanBeHq,DyeCount,IsCrestWorthy,ItemAction,CastTime<s>,Cooldown<s>,ClassJob{Repair},Item{Repair},Item{Glamour},Desynth,IsCollectable,AlwaysCollectable,AetherialReduce,Level{Equip},RequiredPvpRank,EquipRestriction,ClassJobCategory,GrandCompany,ItemSeries,BaseParamModifier,Model{Main},Model{Sub},ClassJob{Use},,Damage{Phys},Damage{Mag},Delay<ms>,,BlockRate,Block,Defense{Phys},Defense{Mag},BaseParam[0],BaseParamValue[0],BaseParam[1],BaseParamValue[1],BaseParam[2],BaseParamValue[2],BaseParam[3],BaseParamValue[3],BaseParam[4],BaseParamValue[4],BaseParam[5],BaseParamValue[5],ItemSpecialBonus,ItemSpecialBonus{Param},BaseParam{Special}[0],BaseParamValue{Special}[0],BaseParam{Special}[1],BaseParamValue{Special}[1],BaseParam{Special}[2],BaseParamValue{Special}[2],BaseParam{Special}[3],BaseParamValue{Special}[3],BaseParam{Special}[4],BaseParamValue{Special}[4],BaseParam{Special}[5],BaseParamValue{Special}[5],MaterializeType,MateriaSlotCount,IsAdvancedMeldingPermitted,IsPvP,SubStatCategory,IsGlamourous
int32,str,sbyte,str,sbyte,sbyte,sbyte,sbyte,sbyte,str,str,Image,ItemLevel,byte,byte,Row,ItemUICategory,ItemSearchCategory,EquipSlotCategory,ItemSortCategory,uint16,uint32,bit&01,bit&02,bit&04,bit&08,uint32,uint32,bit&10,byte,bit&20,ItemAction,byte,uint16,ClassJob,ItemRepairResource,Item,uint16,bit&40,bit&80,uint16,byte,byte,byte,ClassJobCategory,GrandCompany,ItemSeries,byte,int64,int64,ClassJob,byte,uint16,uint16,uint16,byte,uint16,uint16,uint16,uint16,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,ItemSpecialBonus,byte,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,BaseParam,int16,byte,byte,bit&01,bit&02,byte,bit&04
0,"",0,"",0,0,1,0,0,"","",0,0,0,0,0,0,0,0,2,0,1,False,False,False,False,0,0,False,0,False,0,2,0,0,0,0,0,False,False,0,1,0,0,0,0,0,0,"0, 0, 0, 0","0, 0, 0, 0",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,False,False,0,False
1,"길",0,"",0,0,1,0,0,"","길",65002,1,1,16,0,63,0,0,3,0,999999999,False,False,False,False,0,0,False,0,False,0,2,0,0,0,0,0,False,False,0,1,0,0,0,0,0,0,"0, 0, 0, 0","0, 0, 0, 0",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,False,False,0,False
```

### 간단한 예시

```csv
key,0,1,2,3
#,Name,Description,Level,IsActive
int32,str,str,byte,bool
0,"Iron Sword","A basic iron sword",1,True
1,"Health Potion","Restores health",1,True
```

## 지원하는 데이터 타입

### 기본 타입

> **표기법 주의**: CSV 파일에서는 소문자 표기(`str`, `int32`)를 사용하고, Rust 코드에서는 PascalCase 표기(`String`, `Int32`)를 사용합니다.

| CSV 표기 | Rust FieldType | 설명                                         |
| -------- | -------------- | -------------------------------------------- |
| `str`    | `String`       | 문자열                                       |
| `int32`  | `Int32`        | 32비트 정수                                  |
| `uint32` | `Uint32`       | 32비트 무부호 정수                           |
| `int16`  | `Int16`        | 16비트 정수                                  |
| `uint16` | `Uint16`       | 16비트 무부호 정수                           |
| `byte`   | `Byte`         | 8비트 무부호 정수                            |
| `sbyte`  | `SByte`        | 8비트 부호 정수                              |
| `float`  | `Float`        | 부동소수점                                   |
| `bool`   | `Bool`         | 불린값                                       |
| `bit&XX` | `Bit(u8)`      | 비트 플래그 (16진수, 예: `bit&01`, `bit&FF`) |

### 특별 타입

| CSV 표기 | Rust FieldType | TypeScript 타입 | 설명                                      |
| -------- | -------------- | --------------- | ----------------------------------------- |
| `Image`  | `Image`        | `ImagePath`     | UI 이미지 파일 ID (그대로 보존)           |
| `Row`    | `Row`          | `RowId`         | 다른 테이블의 행 참조 (그대로 보존)       |
| `Key`    | `Key`          | `KeyString`     | 키 타입 식별자 (그대로 보존)              |
| `Color`  | `Color`        | `ColorCode`     | 색상 코드 (number로 변환, 외부 파일 참조 안함) |

#### Image 타입 사용 예시

`Image` 타입은 UI 이미지 파일의 ID를 표현하는 특별한 타입입니다. 이 타입의 값은 별도의 후처리 없이 그대로 보존됩니다.

**CSV 예시:**

```csv
key,0,1,2
#,Name,Description,Icon
int32,str,str,Image
1,"Iron Sword","A basic iron sword",021001
2,"Magic Staff","A powerful staff",065432
```

**생성되는 Rust FieldType**: `FieldType::Image`

#### Color 타입 사용 예시

`Color` 타입은 색상 코드를 나타내는 특별한 타입입니다. 이 타입은 외부 Color.csv 파일을 참조하지 않고 number 타입으로 처리됩니다.

**CSV 예시:**

```csv
key,0,1,2
#,Name,Description,TextColor
int32,str,str,Color
1,"Fire Element","Element of fire",16711680
2,"Water Element","Element of water",255
```

**생성되는 Rust FieldType**: `FieldType::Color`
**TypeScript 출력**: `ColorCode` (number alias)

### 커스텀 타입

다음 조건을 만족하는 타입은 커스텀 타입으로 인식됩니다:

1. **대문자로 시작**: `ItemCategory`, `PlayerClass`
2. **특정 패턴 포함**: `Category`, `Action`, `Level`, `Param`, `Job`, `Company`, `Series`

커스텀 타입이 발견되면 동일한 디렉토리에서 `<타입명>.csv` 파일을 찾아 재귀적으로 스키마를 생성합니다.

**주의**: `Image`, `Row`, `Key`, `Color` 타입은 특별 타입으로 분류되어 커스텀 타입 탐색을 하지 않고 각각의 고유한 방식으로 처리됩니다.

## 스키마 생성 프로세스

### 1. 파일 분석

```text
입력 파일 경로 분석 → 스키마 이름 추출 → CSV 파일 파싱
```

### 2. 타입 분석

```text
각 필드의 타입 문자열 분석 → 기본 타입 vs 커스텀 타입 구분
```

### 3. 재귀적 처리

```text
커스텀 타입 발견 → 해당 CSV 파일 존재 확인 → 재귀적 스키마 생성
```

### 4. 의존성 관리

```text
처리 스택 관리 → 순환 의존성 감지 → 에러 또는 성공
```

## 실행 예시

### 성공적인 실행

```bash
cargo run -- --input-file-path fixtures/Item.csv --output-dir-path output
```

**출력:**

```text
input_file_path: "fixtures/Item.csv"
output_dir_path: "output"

=== Generated Schemas ===
Schema: Item
  id: Int32                    (CSV: int32)
  name: String                 (CSV: str)
  icon: Image                  (CSV: Image)
  row_ref: Row                 (CSV: Row)
  category: Custom("ItemCategory")  (CSV: ItemCategory)
  rarity: Custom("Rarity")     (CSV: Rarity)

Schema: ItemCategory
  id: Byte                     (CSV: byte)
  name: String                 (CSV: str)
  description: String          (CSV: str)

Schema: Rarity
  id: Byte                     (CSV: byte)
  name: String                 (CSV: str)
  color: String                (CSV: str)

Successfully built schema: Item
```

### 에러 케이스 - 누락된 파일

```bash
cargo run -- --input-file-path fixtures/Item.csv --output-dir-path output
```

**출력:**

```text
Error: File not found: fixtures/ItemCategory.csv

Required file not found: fixtures/ItemCategory.csv
Make sure all referenced CSV files exist in the same directory as the input file.

Suggested files to create:
  - ItemCategory.csv
  - Rarity.csv
```

## 아키텍처

### 모듈 구조

```text
src/
├── main.rs              # 메인 진입점 및 고수준 제어 흐름
├── cli.rs               # CLI 인자 정의
├── constants.rs         # 상수 정의 (타입 패턴, 기본 타입 등)
└── schema/              # 스키마 관련 모듈
    ├── mod.rs           # 모듈 정의 및 재출력
    ├── types.rs         # 타입 정의 (FieldType, Field, Schema 등)
    ├── error.rs         # 에러 타입들
    ├── builder.rs       # 스키마 빌더 로직
    └── utils.rs         # 유틸리티 함수들
```

### 핵심 컴포넌트

#### SchemaBuilder

- 스키마 생성의 핵심 엔진
- 재귀적 처리 및 순환 의존성 감지
- CSV 파싱 및 타입 분석

#### 타입 시스템

```rust
pub enum FieldType {
    // 기본 타입 (CSV: str, int32, uint32, int16, uint16, byte, sbyte, float, bool, bit&XX)
    String, Int32, Uint32, Int16, Uint16,
    Byte, SByte, Float, Bool, Bit(u8),

    // 특별 타입 (CSV: Image, Row, Key, Color)
    Image, Row, Key, Color,

    // 커스텀 타입 (CSV: ItemCategory, ClassJob 등)
    Custom(String),
}
```

#### 에러 처리

- `FileNotFound`: 필요한 CSV 파일이 없음
- `InvalidFormat`: CSV 형식 오류
- `CircularDependency`: 순환 의존성 감지
- `CsvError`: CSV 파싱 에러
- `IoError`: 파일 I/O 에러

## 확장 가능성

### 추가 가능한 기능

1. **데이터 추출**: 스키마뿐만 아니라 실제 데이터도 구조화된 형태로 출력
2. **스키마 검증**: 생성된 스키마가 실제 데이터와 일치하는지 검증
3. **다양한 출력 형식**: JSON, YAML, Protocol Buffers 등
4. **성능 최적화**: 대용량 파일 처리를 위한 스트리밍 파싱

### 타입 시스템 확장

- 배열 타입 지원: `Array<ItemCategory>`
- 옵셔널 타입 지원: `Option<String>`
- 중첩 구조체 지원

## 문제 해결

### 일반적인 문제들

**Q: "File not found" 에러가 발생합니다**
A:

1. 커스텀 타입에 해당하는 CSV 파일이 같은 디렉토리에 있는지 확인
2. 파일명이 타입명과 정확히 일치하는지 확인 (대소문자 포함)
3. 제안된 파일 목록을 참고하여 누락된 파일 생성

**Q: "Circular dependency detected" 에러가 발생합니다**
A:

1. 타입 A가 타입 B를 참조하고, 타입 B가 다시 타입 A를 참조하는 순환 구조 확인
2. 의존성 체인을 재설계하여 순환 참조 제거

**Q: 기본 타입이 커스텀 타입으로 인식됩니다**
A:

1. `constants.rs`의 `BASIC_TYPES` 배열에 해당 타입이 포함되어 있는지 확인
2. 타입명이 대문자로 시작하지 않도록 수정

**Q: 커스텀 타입이 기본 타입으로 인식됩니다**
A:

1. 타입명이 대문자로 시작하는지 확인
2. `constants.rs`의 `CUSTOM_TYPE_PATTERNS`에 해당 패턴 추가 고려

## 성능 특성

- **메모리 사용량**: O(스키마 수 × 평균 필드 수)
- **시간 복잡도**: O(파일 수 × 평균 필드 수) - 각 파일은 한 번만 처리
- **I/O 최적화**: 파일은 필요할 때만 읽으며, 중복 처리 방지

## 테스트

프로젝트는 포괄적인 테스트 스위트를 포함합니다:

```bash
# 모든 테스트 실행
cargo test

# 특정 모듈 테스트
cargo test schema::builder
cargo test schema::utils
```

### 테스트 커버리지

- 기본 타입 파싱
- 재귀적 스키마 생성
- 순환 의존성 감지
- 에러 케이스 처리
- 유틸리티 함수들

---

_이 문서는 Noumenon Gleaner v0.1.0 기준으로 작성되었습니다._
