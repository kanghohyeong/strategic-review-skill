import { marked } from 'marked'
import { PaginatedGroups, ReportFile, ReportGroup, ReportStatus } from './types'

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  init: '초안',
  submit: '검토 대기',
  approve: '승인',
  reject: '반려',
}

const STATUS_CLASS: Record<ReportStatus, string> = {
  init: 'badge-init',
  submit: 'badge-submit',
  approve: 'badge-approve',
  reject: 'badge-reject',
}

function badge(status: ReportStatus): string {
  return `<span class="badge ${STATUS_CLASS[status]}">${STATUS_LABEL[status]}</span>`
}

const STYLES = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .nav { background: #1a1a2e; color: #fff; padding: 12px 24px; display: flex; align-items: center; gap: 16px; }
  .nav h1 { font-size: 1.1rem; font-weight: 600; }
  .nav a { color: #aab4ff; font-size: 0.9rem; }

  .container { max-width: 960px; margin: 0 auto; padding: 24px 16px; }

  .card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .card-title { font-size: 1.1rem; font-weight: 600; }
  .card-meta { font-size: 0.85rem; color: #666; margin-top: 4px; }

  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; }
  .badge-init { background: #e8e8e8; color: #555; }
  .badge-submit { background: #fff3cd; color: #856404; }
  .badge-approve { background: #d1edde; color: #155724; }
  .badge-reject { background: #f8d7da; color: #842029; }

  .btn { display: inline-block; padding: 8px 18px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
  .btn-primary { background: #0066cc; color: #fff; }
  .btn-primary:hover { background: #0052a3; }
  .btn-success { background: #198754; color: #fff; }
  .btn-success:hover { background: #146c43; }
  .btn-danger { background: #dc3545; color: #fff; }
  .btn-danger:hover { background: #b02a37; }
  .btn-secondary { background: #6c757d; color: #fff; }
  .btn-secondary:hover { background: #565e64; }

  .form-group { margin-bottom: 16px; }
  label { display: block; font-weight: 500; margin-bottom: 6px; font-size: 0.9rem; }
  input[type=text], textarea { width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; font-family: inherit; }
  textarea { resize: vertical; min-height: 100px; }
  input[type=text]:focus, textarea:focus { outline: none; border-color: #0066cc; box-shadow: 0 0 0 2px rgba(0,102,204,0.15); }

  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem; }
  .meta-table th { width: 120px; text-align: left; padding: 8px 12px; background: #f8f8f8; border: 1px solid #e0e0e0; color: #555; font-weight: 500; }
  .meta-table td { padding: 8px 12px; border: 1px solid #e0e0e0; }

  .markdown-body { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
  .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin: 1em 0 0.5em; font-weight: 600; }
  .markdown-body h1 { font-size: 1.6rem; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
  .markdown-body h2 { font-size: 1.3rem; }
  .markdown-body h3 { font-size: 1.1rem; }
  .markdown-body p { margin-bottom: 12px; }
  .markdown-body ul, .markdown-body ol { margin: 0 0 12px 24px; }
  .markdown-body li { margin-bottom: 4px; }
  .markdown-body code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: 'Courier New', monospace; }
  .markdown-body pre { background: #f0f0f0; padding: 16px; border-radius: 6px; overflow-x: auto; margin-bottom: 12px; }
  .markdown-body pre code { background: none; padding: 0; }
  .markdown-body blockquote { border-left: 4px solid #ccc; padding-left: 16px; color: #666; margin-bottom: 12px; }
  .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
  .markdown-body th, .markdown-body td { border: 1px solid #ddd; padding: 8px 12px; }
  .markdown-body th { background: #f8f8f8; font-weight: 600; }

  .version-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .version-chip { padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; border: 1px solid #ccc; background: #f8f8f8; }
  .version-chip.active { background: #0066cc; color: #fff; border-color: #0066cc; }

  .review-section { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
  .review-section h3 { margin-bottom: 16px; font-size: 1rem; color: #444; }
  .review-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .comment-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 6px; padding: 14px 16px; margin-bottom: 16px; }
  .comment-box strong { color: #795548; }

  .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 24px; }
  .pagination a, .pagination span { padding: 6px 14px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; background: #fff; }
  .pagination .active { background: #0066cc; color: #fff; border-color: #0066cc; }
  .pagination a:hover { background: #f0f0f0; text-decoration: none; }

  .error-page { text-align: center; padding: 80px 24px; }
  .error-page h2 { font-size: 2rem; color: #dc3545; margin-bottom: 12px; }
  .error-page p { color: #666; margin-bottom: 24px; }

  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .page-header h2 { font-size: 1.4rem; }

  .alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 0.9rem; }
  .alert-error { background: #f8d7da; border: 1px solid #f5c2c7; color: #842029; }

  .empty-state { text-align: center; padding: 60px 24px; color: #888; }
  .empty-state p { margin-bottom: 16px; }
</style>
`

export function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Strategic Review</title>
  ${STYLES}
</head>
<body>
  <nav class="nav">
    <h1>Strategic Review</h1>
    <a href="/">보고서 목록</a>
    <a href="/reports/new">새 보고서</a>
  </nav>
  <div class="container">
    ${body}
  </div>
</body>
</html>`
}

export function renderListPage(data: PaginatedGroups): string {
  const { groups, currentPage, totalPages, totalCount } = data

  let cardsHtml = ''
  if (groups.length === 0) {
    cardsHtml = `<div class="empty-state"><p>등록된 보고서가 없습니다.</p><a href="/reports/new" class="btn btn-primary">첫 보고서 등록하기</a></div>`
  } else {
    for (const group of groups) {
      const f = group.latestFile
      const versionCount = group.allFiles.length
      cardsHtml += `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title"><a href="/reports/${escapeHtml(f.filename)}">${escapeHtml(f.name) || '(이름 없음)'}</a></div>
            <div class="card-meta">
              ${escapeHtml(f.prefix.replace('_', ' '))} &middot; v${f.version} (총 ${versionCount}개 버전)
            </div>
          </div>
          ${badge(f.status)}
        </div>
        <div style="font-size:0.9rem;color:#555;margin-top:8px;">${escapeHtml(f.objective).slice(0, 120)}${f.objective.length > 120 ? '...' : ''}</div>
      </div>`
    }
  }

  let paginationHtml = ''
  if (totalPages > 1) {
    paginationHtml = '<div class="pagination">'
    if (currentPage > 1) {
      paginationHtml += `<a href="/?page=${currentPage - 1}">이전</a>`
    }
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        paginationHtml += `<span class="active">${i}</span>`
      } else {
        paginationHtml += `<a href="/?page=${i}">${i}</a>`
      }
    }
    if (currentPage < totalPages) {
      paginationHtml += `<a href="/?page=${currentPage + 1}">다음</a>`
    }
    paginationHtml += '</div>'
  }

  const body = `
    <div class="page-header">
      <h2>보고서 목록 <small style="font-size:0.8em;color:#888;">(총 ${totalCount}건)</small></h2>
      <a href="/reports/new" class="btn btn-primary">새 보고서</a>
    </div>
    ${cardsHtml}
    ${paginationHtml}
  `

  return layout('보고서 목록', body)
}

export function renderNewReportForm(error?: string): string {
  const errorHtml = error
    ? `<div class="alert alert-error">${escapeHtml(error)}</div>`
    : ''

  const body = `
    <div class="page-header">
      <h2>새 보고서 등록</h2>
      <a href="/" class="btn btn-secondary">목록으로</a>
    </div>
    ${errorHtml}
    <div class="card">
      <form method="POST" action="/reports">
        <div class="form-group">
          <label for="name">보고서 이름 *</label>
          <input type="text" id="name" name="name" required placeholder="예: Q1 마케팅 전략 검토">
        </div>
        <div class="form-group">
          <label for="objective">목표 *</label>
          <textarea id="objective" name="objective" required placeholder="이 보고서의 목표를 입력하세요"></textarea>
        </div>
        <div class="form-group">
          <label for="constraints">제약 조건</label>
          <textarea id="constraints" name="constraints" placeholder="제약 조건이 있다면 입력하세요"></textarea>
        </div>
        <div style="display:flex;gap:12px;">
          <button type="submit" class="btn btn-primary">보고서 생성</button>
          <a href="/" class="btn btn-secondary">취소</a>
        </div>
      </form>
    </div>
  `

  return layout('새 보고서 등록', body)
}

export function renderDetailPage(file: ReportFile, group: ReportGroup): string {
  const renderedContent = file.content
    ? (marked.parse(file.content) as string)
    : '<p style="color:#888">본문 내용이 없습니다.</p>'

  const versionNavHtml = group.allFiles
    .map((f) => {
      const isActive = f.filename === file.filename
      return `<a href="/reports/${escapeHtml(f.filename)}" class="version-chip ${isActive ? 'active' : ''}">v${f.version} ${badge(f.status)}</a>`
    })
    .join('')

  const commentHtml =
    file.reviewComment
      ? `<div class="comment-box"><strong>검토 의견:</strong> ${escapeHtml(file.reviewComment)}</div>`
      : ''

  let reviewFormHtml = ''
  if (file.status === 'submit') {
    reviewFormHtml = `
    <div class="review-section">
      <h3>보고서 검토</h3>
      <div class="review-actions">
        <form method="POST" action="/reports/${escapeHtml(file.filename)}/approve" style="display:inline;">
          <button type="submit" class="btn btn-success" onclick="return confirm('승인하시겠습니까?')">승인</button>
        </form>
        <div style="flex:1;min-width:280px;">
          <form method="POST" action="/reports/${escapeHtml(file.filename)}/reject">
            <div class="form-group" style="margin-bottom:8px;">
              <input type="text" name="comment" placeholder="반려 사유를 입력하세요" required style="width:100%;">
            </div>
            <button type="submit" class="btn btn-danger">반려</button>
          </form>
        </div>
      </div>
    </div>`
  }

  const body = `
    <div class="page-header">
      <h2>${escapeHtml(file.name) || '(이름 없음)'}</h2>
      <a href="/" class="btn btn-secondary">목록으로</a>
    </div>

    <table class="meta-table">
      <tr><th>파일명</th><td><code>${escapeHtml(file.filename)}</code></td></tr>
      <tr><th>상태</th><td>${badge(file.status)}</td></tr>
      <tr><th>목표</th><td>${escapeHtml(file.objective)}</td></tr>
      <tr><th>제약 조건</th><td>${escapeHtml(file.constraints) || '-'}</td></tr>
    </table>

    ${commentHtml}

    <div style="margin-bottom:12px;">
      <strong style="font-size:0.9rem;color:#555;">버전 이력</strong>
      <div class="version-nav" style="margin-top:8px;">${versionNavHtml}</div>
    </div>

    <div class="markdown-body">${renderedContent}</div>

    ${reviewFormHtml}
  `

  return layout(file.name || '보고서 상세', body)
}

export function renderErrorPage(message: string, code: number): string {
  const body = `
    <div class="error-page">
      <h2>${code} 오류</h2>
      <p>${escapeHtml(message)}</p>
      <a href="/" class="btn btn-primary">목록으로 돌아가기</a>
    </div>
  `
  return layout(`${code} 오류`, body)
}
