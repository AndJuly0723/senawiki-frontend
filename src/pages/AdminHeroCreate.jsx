import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser, isAdminUser } from '../utils/authStorage'
import {
  addCustomHero,
  heroGradeOptions,
  heroTypeOptions,
  slugifyId,
  uploadImage,
} from '../utils/contentStorage'

const initialHeroForm = {
  id: '',
  name: '',
  type: heroTypeOptions[0].key,
  grade: heroGradeOptions[0].key,
  nickname: '',
  acquisition: '',
  usage: '',
  gear: '',
  hasSkill2: true,
}

const initialHeroFiles = {
  image: null,
  basicSkillImage: null,
  skill1Image: null,
  skill2Image: null,
  passiveSkillImage: null,
}

const toArray = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

function AdminHeroCreate() {
  const user = getStoredUser()
  const isAdmin = useMemo(() => isAdminUser(user), [user])
  const navigate = useNavigate()

  const [heroForm, setHeroForm] = useState(initialHeroForm)
  const [heroFiles, setHeroFiles] = useState(initialHeroFiles)
  const [heroStatus, setHeroStatus] = useState({ type: 'idle', message: '' })

  const onHeroFileChange = (field, file) => {
    setHeroFiles((prev) => ({ ...prev, [field]: file ?? null }))
  }

  const onHeroSubmit = async (event) => {
    event.preventDefault()
    setHeroStatus({ type: 'idle', message: '' })

    try {
      if (!heroFiles.image) {
        throw new Error('영웅 대표 이미지는 필수입니다.')
      }
      if (heroForm.hasSkill2 && !heroFiles.skill2Image) {
        throw new Error('스킬2를 사용하는 영웅은 스킬2 이미지가 필수입니다.')
      }

      const [imageKey, basicSkillImageKey, skill1ImageKey, skill2ImageKey, passiveSkillImageKey] = await Promise.all([
        uploadImage(heroFiles.image, 'HERO'),
        uploadImage(heroFiles.basicSkillImage, 'HERO'),
        uploadImage(heroFiles.skill1Image, 'HERO'),
        uploadImage(heroFiles.skill2Image, 'HERO'),
        uploadImage(heroFiles.passiveSkillImage, 'HERO'),
      ])

      const heroName = heroForm.name.trim()
      const heroId = heroForm.id.trim() || slugifyId(heroName)
      const selectedType = heroTypeOptions.find((option) => option.key === heroForm.type)

      await addCustomHero({
        ...heroForm,
        id: heroId,
        name: heroName,
        typeIcon: selectedType?.icon ?? '',
        imageKey,
        acquisition: toArray(heroForm.acquisition),
        usage: toArray(heroForm.usage),
        gear: toArray(heroForm.gear),
        basicSkillImage: basicSkillImageKey,
        skill1Image: skill1ImageKey,
        skill2Image: skill2ImageKey,
        passiveSkillImage: passiveSkillImageKey,
      })

      setHeroForm(initialHeroForm)
      setHeroFiles(initialHeroFiles)
      setHeroStatus({ type: 'success', message: `영웅이 등록되었습니다. (ID: ${heroId})` })
    } catch (error) {
      setHeroStatus({ type: 'error', message: error.message || '영웅 등록에 실패했습니다.' })
    }
  }

  const handleSuccessConfirm = () => {
    setHeroStatus({ type: 'idle', message: '' })
    navigate('/admin')
  }

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="admin-empty">
          <h1>관리자 권한이 필요합니다</h1>
          <p>관리자 계정으로 로그인 후 이용해주세요.</p>
          <div className="admin-empty-actions">
            <Link to="/login" className="auth-button">로그인</Link>
            <Link to="/" className="auth-button auth-button--ghost">홈으로</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page admin-page--form">
      <div className="admin-top-actions">
        <Link to="/admin" className="auth-button auth-button--ghost">관리자 메인</Link>
      </div>
      <form className="admin-card" onSubmit={onHeroSubmit}>
        <h2>영웅 등록</h2>
        <div className="admin-form-grid">
          <label className="admin-form-col">
            영웅 이름
            <input
              type="text"
              value={heroForm.name}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="admin-form-col">
            영웅 ID (선택)
            <input
              type="text"
              placeholder="비우면 이름으로 자동 생성"
              value={heroForm.id}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            타입
            <select
              value={heroForm.type}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {heroTypeOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-form-col">
            등급
            <select
              value={heroForm.grade}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, grade: event.target.value }))}
            >
              {heroGradeOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-form-col">
            별명
            <input
              type="text"
              value={heroForm.nickname}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, nickname: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            획득 경로
            <input
              type="text"
              value={heroForm.acquisition}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, acquisition: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            사용 콘텐츠
            <input
              type="text"
              value={heroForm.usage}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, usage: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            장비
            <input
              type="text"
              value={heroForm.gear}
              onChange={(event) => setHeroForm((prev) => ({ ...prev, gear: event.target.value }))}
            />
          </label>
        </div>
        <div className="admin-form-grid">
          <label className="admin-form-col">
            영웅 이미지
            <input type="file" accept="image/*" onChange={(event) => onHeroFileChange('image', event.target.files?.[0])} required />
          </label>
          <label className="admin-form-col">
            기본공격 이미지
            <input type="file" accept="image/*" onChange={(event) => onHeroFileChange('basicSkillImage', event.target.files?.[0])} />
          </label>
        </div>
        <div className="admin-form-grid admin-form-grid--3">
          <label className="admin-form-col">
            스킬1 이미지
            <input type="file" accept="image/*" onChange={(event) => onHeroFileChange('skill1Image', event.target.files?.[0])} />
          </label>
          <label className="admin-form-col">
            스킬2 이미지
            <input type="file" accept="image/*" onChange={(event) => onHeroFileChange('skill2Image', event.target.files?.[0])} />
          </label>
          <label className="admin-form-col">
            패시브 이미지
            <input type="file" accept="image/*" onChange={(event) => onHeroFileChange('passiveSkillImage', event.target.files?.[0])} />
          </label>
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={heroForm.hasSkill2}
            onChange={(event) => setHeroForm((prev) => ({ ...prev, hasSkill2: event.target.checked }))}
          />
          스킬2 사용
        </label>
        {heroStatus.type === 'error' ? <div className="admin-message admin-message--error">{heroStatus.message}</div> : null}
        <button type="submit" className="admin-submit-button">영웅 등록</button>
      </form>
      {heroStatus.type === 'success' ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button
            className="community-modal-backdrop"
            type="button"
            onClick={handleSuccessConfirm}
            aria-label="닫기"
          />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <h2>알림</h2>
            </div>
            <div className="community-modal-body">{heroStatus.message}</div>
            <div className="community-modal-actions">
              <button
                className="community-modal-cancel"
                type="button"
                onClick={handleSuccessConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminHeroCreate
