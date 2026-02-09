import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUser, isAdminUser } from '../utils/authStorage'
import {
  addCustomPet,
  petGradeOptions,
  slugifyId,
  uploadImage,
} from '../utils/contentStorage'

const initialPetForm = {
  id: '',
  name: '',
  grade: petGradeOptions[0].key,
  nickname: '',
  acquisition: '',
  skillName: '',
  skillTarget: '',
  skillDescription: '',
}

const initialPetFiles = {
  image: null,
  skillImage: null,
}

const toArray = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

function AdminPetCreate() {
  const user = getStoredUser()
  const isAdmin = useMemo(() => isAdminUser(user), [user])

  const [petForm, setPetForm] = useState(initialPetForm)
  const [petFiles, setPetFiles] = useState(initialPetFiles)
  const [petStatus, setPetStatus] = useState({ type: 'idle', message: '' })

  const onPetFileChange = (field, file) => {
    setPetFiles((prev) => ({ ...prev, [field]: file ?? null }))
  }

  const onPetSubmit = async (event) => {
    event.preventDefault()
    setPetStatus({ type: 'idle', message: '' })

    try {
      if (!petFiles.image) {
        throw new Error('펫 대표 이미지는 필수입니다.')
      }

      const [imageKey, skillImageKey] = await Promise.all([
        uploadImage(petFiles.image, 'PET'),
        uploadImage(petFiles.skillImage, 'PET'),
      ])

      const petName = petForm.name.trim()
      const petId = petForm.id.trim() || slugifyId(petName)

      await addCustomPet({
        ...petForm,
        id: petId,
        name: petName,
        imageKey,
        skillImageKey,
        acquisition: toArray(petForm.acquisition),
        skill: {
          name: petForm.skillName,
          target: petForm.skillTarget,
          descriptionLines: petForm.skillDescription
            .split(',')
            .map((line) => line.trim())
            .filter(Boolean),
        },
      })

      setPetForm(initialPetForm)
      setPetFiles(initialPetFiles)
      setPetStatus({ type: 'success', message: `펫이 등록되었습니다. (ID: ${petId})` })
    } catch (error) {
      setPetStatus({ type: 'error', message: error.message || '펫 등록에 실패했습니다.' })
    }
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
      <form className="admin-card" onSubmit={onPetSubmit}>
        <h2>펫 등록</h2>
        <div className="admin-form-grid">
          <label className="admin-form-col">
            펫 이름
            <input
              type="text"
              value={petForm.name}
              onChange={(event) => setPetForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="admin-form-col">
            펫 ID (선택)
            <input
              type="text"
              placeholder="비우면 이름으로 자동 생성"
              value={petForm.id}
              onChange={(event) => setPetForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            등급
            <select
              value={petForm.grade}
              onChange={(event) => setPetForm((prev) => ({ ...prev, grade: event.target.value }))}
            >
              {petGradeOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-form-col">
            별명
            <input
              type="text"
              value={petForm.nickname}
              onChange={(event) => setPetForm((prev) => ({ ...prev, nickname: event.target.value }))}
            />
          </label>
          <label className="admin-form-col admin-form-col--full">
            획득 경로
            <input
              type="text"
              value={petForm.acquisition}
              onChange={(event) => setPetForm((prev) => ({ ...prev, acquisition: event.target.value }))}
            />
          </label>
        </div>
        <div className="admin-form-grid">
          <label className="admin-form-col">
            펫 이미지
            <input type="file" accept="image/*" onChange={(event) => onPetFileChange('image', event.target.files?.[0])} required />
          </label>
          <label className="admin-form-col">
            스킬 이미지
            <input type="file" accept="image/*" onChange={(event) => onPetFileChange('skillImage', event.target.files?.[0])} />
          </label>
        </div>
        <div className="admin-form-grid">
          <label className="admin-form-col">
            스킬명
            <input
              type="text"
              value={petForm.skillName}
              onChange={(event) => setPetForm((prev) => ({ ...prev, skillName: event.target.value }))}
            />
          </label>
          <label className="admin-form-col">
            스킬 대상
            <input
              type="text"
              placeholder="예: 모든 적군"
              value={petForm.skillTarget}
              onChange={(event) => setPetForm((prev) => ({ ...prev, skillTarget: event.target.value }))}
            />
          </label>
        </div>
        <label>
          스킬 설명 (쉼표로 줄 구분)
          <input
            type="text"
            value={petForm.skillDescription}
            onChange={(event) => setPetForm((prev) => ({ ...prev, skillDescription: event.target.value }))}
          />
        </label>
        {petStatus.type !== 'idle' ? <div className={`admin-message admin-message--${petStatus.type}`}>{petStatus.message}</div> : null}
        <button type="submit" className="admin-submit-button">펫 등록</button>
      </form>
    </section>
  )
}

export default AdminPetCreate
