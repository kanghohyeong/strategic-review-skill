# reject 상태 처리 가이드

## instructions

### Step 1: 검토 의견 확인

* 보고서의 review comment 에 명시된 검토 의견을 확인합니다.
* 검토 의견이 존재하지 않는다면 사용자에게 검토 의견을 작성하도록 안내합니다.

### Step 2: 보고서 작성

* `strategic-review` skill 을 사용하여 검토 의견이 반영된 보고서를 작성합니다.

### Step 3: 보고서 저장

* `{기존_보고서_파일명}.{버전}.md` 네이밍 규칙에 따라 파일을 저장합니다.
  - 버전은 v2, v3, v4 형식으로 작성합니다.
  - ex. 20260222_185700.v3.md

* frontmatter 는 기존 보고서를 그대로 따르되, status / review-comment 를 수정합니다.
  - status: 'submit'
  - review-comment 는 제거합니다.

