import { Router, Request, Response } from 'express'
import {
  getPaginatedGroups,
  getReportByFilename,
  getGroupByPrefix,
  createReport,
  approveReport,
  rejectReport,
} from './reportService'
import {
  renderListPage,
  renderNewReportForm,
  renderDetailPage,
  renderErrorPage,
} from './templates'

export const router = Router()

function handleError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    if (err.message === 'Invalid filename' || err.message.startsWith('ENOENT')) {
      res.status(404).send(renderErrorPage('보고서를 찾을 수 없습니다.', 404))
    } else if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).send(renderErrorPage('보고서를 찾을 수 없습니다.', 404))
    } else {
      console.error(err)
      res.status(500).send(renderErrorPage('서버 오류가 발생했습니다.', 500))
    }
  } else {
    console.error(err)
    res.status(500).send(renderErrorPage('서버 오류가 발생했습니다.', 500))
  }
}

// GET / — 목록 (10건/페이지, 최신순)
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1
    const data = getPaginatedGroups(page)
    res.send(renderListPage(data))
  } catch (err) {
    handleError(res, err)
  }
})

// GET /reports/new — 등록 폼
router.get('/reports/new', (_req: Request, res: Response) => {
  res.send(renderNewReportForm())
})

// POST /reports — 보고서 생성
router.post('/reports', (req: Request, res: Response) => {
  try {
    const name = String(req.body.name ?? '').trim()
    const objective = String(req.body.objective ?? '').trim()
    const constraints = String(req.body.constraints ?? '').trim()

    if (!name) {
      res.send(renderNewReportForm('보고서 이름은 필수입니다.'))
      return
    }
    if (!objective) {
      res.send(renderNewReportForm('목표는 필수입니다.'))
      return
    }

    const filename = createReport({ name, objective, constraints })
    res.redirect(`/reports/${filename}`)
  } catch (err) {
    handleError(res, err)
  }
})

// GET /reports/:filename — 상세
router.get('/reports/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const file = getReportByFilename(filename)
    const group = getGroupByPrefix(file.prefix)
    res.send(renderDetailPage(file, group))
  } catch (err) {
    handleError(res, err)
  }
})

// POST /reports/:filename/approve — 승인
router.post('/reports/:filename/approve', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    approveReport(filename)
    res.redirect(`/reports/${filename}`)
  } catch (err) {
    handleError(res, err)
  }
})

// POST /reports/:filename/reject — 반려
router.post('/reports/:filename/reject', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const comment = String(req.body.comment ?? '').trim()

    if (!comment) {
      const file = getReportByFilename(filename)
      const group = getGroupByPrefix(file.prefix)
      res.send(renderDetailPage(file, group))
      return
    }

    rejectReport(filename, comment)
    res.redirect(`/reports/${filename}`)
  } catch (err) {
    handleError(res, err)
  }
})
