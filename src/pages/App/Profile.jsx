// Profile.jsx - Versão Tecnológica com Componentes
import { useState, useEffect, useRef } from "react"
import { auth, db } from "../../services/firebase"
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"

import FarmEditForm from "../../components/App/Profile/FarmEditForm"
// Componentes
import ProfileLoadingScreen from "../../components/App/Profile/ProfileLoadScreen"
import AlertMessage from "../../components/App/Profile/AlertMessage"
import PersonalInfoView from "../../components/App/Profile/PersonalInfoView"
import FarmInfoView from "../../components/App/Profile/FarmInfoView"
import ProfileEditForm from "../../components/App/Profile/ProfileEditForm"
import MenuBar from "../../components/App/Global/MenuBar"
import { ACCOUNT_ROLES, getUserAccessProfile, isOperationalRole } from "../../services/accessControl"
import {
  accountIdentifierMessage,
  attachUniquePhoneToProfile,
  maskAccountPhone,
} from "../../services/accountIdentity"
import { LANGUAGE_OPTIONS, translate, useLanguage } from "../../contexts/LanguageContext"

// CSS
import "../../styles/App/Profile.css"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [farmData, setFarmData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [farmCount, setFarmCount] = useState(null)
  const [totalFarmArea, setTotalFarmArea] = useState(null)
  const [editingFarm, setEditingFarm] = useState(false)
  const [savingFarm, setSavingFarm] = useState(false)
  const [passwordResetting, setPasswordResetting] = useState(false)
  const [languageSaving, setLanguageSaving] = useState(false)
  const editSectionRef = useRef(null)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    type: "",
    document: "",
    hectares: "",
    email: "",
    role: ACCOUNT_ROLES.ADMIN,
    profileIcon: "👨‍🌾",
    phone: "",
    city: "",
    state: ""
  })
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()
  const { language, locale, setLanguage, t } = useLanguage()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const profile = await loadUserData(currentUser.uid)
        await loadFarmData(profile?.ownerId || currentUser.uid)
      } else {
        navigate("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!editing) return

    const scrollToEditForm = window.setTimeout(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })

      window.setTimeout(() => {
        editSectionRef.current
          ?.querySelector("input, select, textarea")
          ?.focus({ preventScroll: true })
      }, 350)
    }, 80)

    return () => window.clearTimeout(scrollToEditForm)
  }, [editing])

  const loadUserData = async (uid) => {
    try {
      const data = await getUserAccessProfile(uid)
      if (data) {
        setUserData(data)
        setFormData({
          name: data.name || "",
          age: data.age || "",
          type: data.type || "",
          document: data.documentMasked || data.document || "",
          hectares: data.hectares || "",
          email: data.email || "",
          role: data.role || ACCOUNT_ROLES.ADMIN,
          profileIcon: data.profileIcon || "👨‍🌾",
          phone: "",
          city: data.city || "",
          state: data.state || ""
        })
      }
      return data
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      showAlert("error", t("profile.loadError"))
      return null
    }
  }

  const loadFarmData = async (uid) => {
    try {
      const farmsRef = collection(db, "farms")
      const q = query(farmsRef, where("ownerId", "==", uid))
      const querySnapshot = await getDocs(q)
      setFarmCount(querySnapshot.size)
      setTotalFarmArea(querySnapshot.docs.reduce((total, farmDoc) => {
        const area = Number(farmDoc.data().area_total)
        return Number.isFinite(area) ? total + area : total
      }, 0))

      if (!querySnapshot.empty) {
        const farmDoc = querySnapshot.docs[0]
        const data = farmDoc.data()
        
        setFarmData({
          id: farmDoc.id,
          name: data.name || "",
          area_total: data.area_total || "0",
          bairro: data.bairro || "",
          cep: data.cep || "",
          createdAt: data.createdAt || null,
          data_aquisicao: data.data_aquisicao || "",
          municipio: data.municipio || "",
          plantacao: data.plantacao || "",
          telefone: data.telefone || "",
          telefone_mascarado: data.telefone_mascarado || "",
          tipo_proprietario: data.tipo_proprietario || "",
          uf: data.uf || ""
        })
      } else {
        setFarmData(null)
      }
    } catch (error) {
      console.error("Erro ao carregar fazenda:", error)
      setFarmCount(null)
      setTotalFarmArea(null)
      showAlert("error", t("profile.farmLoadError"))
    }
  }

  const showAlert = (type, text) => {
    setAlertMessage({ type, text })
    setTimeout(() => setAlertMessage({ type: "", text: "" }), 3000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleIconSelect = (icon) => {
    setFormData({ ...formData, profileIcon: icon })
  }

  const handleSave = async () => {
    if (!user) return

    if ((userData?.profileCollection || "owners") !== "owners") {
      showAlert("error", t("profile.teamManaged"))
      return
    }

    setSaving(true)
    try {
      const userRef = doc(db, "owners", user.uid)

      if (formData.phone.replace(/\D/g, "").length >= 10) {
        await attachUniquePhoneToProfile({
          profileCollection: "owners",
          userId: user.uid,
          phone: formData.phone,
        })
      }

      await updateDoc(userRef, {
        name: formData.name,
        age: parseInt(formData.age) || null,
        hectares: parseFloat(formData.hectares) || null,
        profileIcon: formData.profileIcon,
        city: formData.city,
        state: formData.state,
        updatedAt: new Date().toISOString()
      })

      showAlert("success", t("profile.updated"))
      setEditing(false)
      await loadUserData(user.uid)
      window.dispatchEvent(new Event("zenith-user-role-updated"))
    } catch (error) {
      console.error("Erro ao atualizar:", error)
      showAlert("error", accountIdentifierMessage(error) || t("profile.updateError"))
    } finally {
      setSaving(false)
    }
  }

  const handleLanguageChange = async (nextLanguage) => {
    if (!user || nextLanguage === language || languageSaving) return

    setLanguageSaving(true)
    setLanguage(nextLanguage)
    setUserData((current) => current ? { ...current, language: nextLanguage } : current)

    try {
      const profileCollection = userData?.profileCollection || "owners"
      await updateDoc(doc(db, profileCollection, user.uid), {
        language: nextLanguage,
      })

      showAlert("success", translate(nextLanguage, "profile.languageUpdated"))
      window.dispatchEvent(new Event("zenith-language-updated"))
    } catch (error) {
      console.warn("Idioma salvo apenas neste dispositivo:", error)
      showAlert("success", translate(nextLanguage, "profile.languageDeviceUpdated"))
    } finally {
      setLanguageSaving(false)
    }
  }

  const handleSaveFarm = async (updatedFarmData) => {
  if (!user || !farmData?.id) return

  setSavingFarm(true)
  try {
    const farmRef = doc(db, "farms", farmData.id)
    const phoneDigits = updatedFarmData.telefone.replace(/\D/g, "")
    await updateDoc(farmRef, {
      name: updatedFarmData.name,
      area_total: parseFloat(updatedFarmData.area_total) || 0,
      plantacao: updatedFarmData.plantacao || "",
      municipio: updatedFarmData.municipio,
      uf: updatedFarmData.uf,
      bairro: updatedFarmData.bairro || "",
      cep: updatedFarmData.cep || "",
      data_aquisicao: updatedFarmData.data_aquisicao || "",
      ...(phoneDigits.length >= 10
        ? { telefone_mascarado: maskAccountPhone(updatedFarmData.telefone) }
        : {}),
      tipo_proprietario: updatedFarmData.tipo_proprietario || "Proprietário",
      updatedAt: new Date().toISOString()
    })

    showAlert("success", t("profile.farmUpdated"))
    setEditingFarm(false)
    await loadFarmData(user.uid)
  } catch (error) {
    console.error("Erro ao atualizar fazenda:", error)
    showAlert("error", t("profile.farmUpdateError"))
  } finally {
    setSavingFarm(false)
  }
}

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Erro ao sair:", error)
    }
  }

  const handleAddFarm = () => {
    navigate("/cadastrar-fazenda")
  }

  const handleEditFarm = () => {
  setEditingFarm(true)
}

  const calculateMemberTime = () => {
    const accountCreatedAt = userData?.createdAt || user?.metadata?.creationTime
    if (!accountCreatedAt) return null
    const created = accountCreatedAt?.toDate
      ? accountCreatedAt.toDate()
      : new Date(accountCreatedAt)
    if (Number.isNaN(created.getTime())) return null
    const now = new Date()
    const diffTime = Math.max(0, now - created)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t("profile.lessThanDay")
    if (diffDays === 1) return t("profile.oneDay")
    if (diffDays < 30) return t("profile.days", { count: diffDays })
    if (diffDays < 60) return t("profile.oneMonth")
    if (diffDays < 365) return t("profile.months", { count: Math.floor(diffDays / 30) })
    if (diffDays < 730) return t("profile.oneYear")
    return t("profile.yearsCount", { count: Math.floor(diffDays / 365) })
  }

  const handlePasswordReset = async () => {
    if (!user?.email || passwordResetting) return

    setPasswordResetting(true)
    try {
      await sendPasswordResetEmail(auth, user.email)
      showAlert("success", t("profile.passwordSent"))
    } catch (error) {
      console.error("Erro ao enviar redefinição de senha:", error)
      showAlert("error", t("profile.passwordError"))
    } finally {
      setPasswordResetting(false)
    }
  }

  const openProfileEditor = () => {
    setActiveTab(null)
    setEditingFarm(false)
    setEditing(true)
  }

  const getTotalHectares = () => {
    if (totalFarmArea !== null && farmCount > 0) {
      return totalFarmArea.toFixed(1)
    }
    if (farmCount === 0 && userData?.hectares !== undefined && userData?.hectares !== null) {
      const userArea = Number(userData.hectares)
      if (Number.isFinite(userArea)) return userArea.toFixed(1)
    }
    return null
  }

  const formatPhone = (phone) => {
    if (!phone) return t("common.notInformed")
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return phone
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setFormData({
      name: userData?.name || "",
      age: userData?.age || "",
      type: userData?.type || "",
      document: userData?.document || "",
      hectares: userData?.hectares || "",
      email: user?.email || "",
      role: userData?.role || ACCOUNT_ROLES.ADMIN,
      profileIcon: userData?.profileIcon || "👨‍🌾",
      phone: "",
      city: userData?.city || "",
      state: userData?.state || ""
    })
  }

  const roleLabels = {
    [ACCOUNT_ROLES.ADMIN]: t("profile.roleAdmin"),
    [ACCOUNT_ROLES.EMPLOYEE]: t("profile.roleEmployee"),
    [ACCOUNT_ROLES.COLLABORATOR]: t("profile.roleCollaborator")
  }

  const displayName = userData?.name || user?.displayName || t("profile.farmer")
  const canManageProfile = !isOperationalRole(userData?.role)
  const profileInitial = displayName.trim().charAt(0).toLocaleUpperCase(locale) || "A"
  const profilePhotoIcon = editing ? formData.profileIcon : userData?.profileIcon
  const membershipTime = calculateMemberTime()
  const totalHectares = getTotalHectares()
  const userAge = Number(userData?.age)
  const hasValidAge = Number.isInteger(userAge) && userAge > 0
  const locationLabel = [userData?.city, userData?.state].filter(Boolean).join(" - ") || farmData?.municipio || t("profile.locationMissing")
  const currentLanguageLabel = LANGUAGE_OPTIONS.find((option) => option.value === language)?.label || LANGUAGE_OPTIONS[0].label

  if (loading) {
    return <ProfileLoadingScreen />
  }

  return (
    <>
      <div className="profile-container-tech profile-redesign" data-system-bar-color="#f4f9ef">
        <header className="profile-mobile-shell">
          <div className="profile-mobile-top">
            <div className="profile-photo-wrap">
              {profilePhotoIcon ? (
                <span className="profile-photo-icon">{profilePhotoIcon}</span>
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt="" />
              ) : (
                <span>{profileInitial}</span>
              )}
              <span className="profile-photo-status material-symbols-outlined" aria-hidden="true">verified</span>
            </div>

            <div className="profile-quick-actions" aria-label={t("profile.quickActions")}>
              {canManageProfile && (
                <button type="button" onClick={openProfileEditor}>
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  {t("profile.edit")}
                </button>
              )}
              <button type="button" onClick={handlePasswordReset} disabled={passwordResetting}>
                <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
                {passwordResetting ? t("profile.sending") : t("profile.changePassword")}
              </button>
            </div>
          </div>

          <div className="profile-mobile-name">
            <h1>{displayName}</h1>
            <p>{roleLabels[userData?.role] || t("profile.personalAccount")}</p>
          </div>
        </header>

        <section className="profile-dark-card" aria-label={t("profile.propertySummary")}>
          <span className="profile-dark-icon material-symbols-outlined" aria-hidden="true">agriculture</span>
          <div>
            <strong>{farmData?.name || t("profile.property")}</strong>
            <small>{locationLabel}</small>
          </div>
          <span className="profile-dark-action material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </section>

        <section className="profile-summary profile-summary-compact" aria-labelledby="profile-summary-title">
          <h2 id="profile-summary-title">{t("profile.summary")}</h2>
          <div className="profile-summary-grid">
            <article>
              <span className="material-symbols-outlined" aria-hidden="true">potted_plant</span>
              <strong>{totalHectares ? totalHectares.replace(".", ",") : "--"}</strong>
              <small>{t("common.hectares")}</small>
            </article>
            <article>
              <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              <strong>{hasValidAge ? userAge : "--"}</strong>
              <small>{t("common.years")}</small>
            </article>
            <article className="farm-stat">
              <span className="material-symbols-outlined" aria-hidden="true">home_work</span>
              <strong>{farmCount ?? "--"}</strong>
              <small>{farmCount === 1 ? t("common.farm") : t("common.farms")}</small>
            </article>
          </div>
        </section>

        <AlertMessage type={alertMessage.type} text={alertMessage.text} />

        <section className="profile-settings" aria-labelledby="profile-settings-title">
          <div className="profile-section-title">
            <h2 id="profile-settings-title">{t("profile.settings")}</h2>
          </div>
          <div className="profile-settings-list">
            <div className={`profile-setting-item ${activeTab === "pessoal" ? "is-open" : ""}`}>
              <button
                type="button"
                aria-expanded={activeTab === "pessoal"}
                onClick={() => {
                  if (editing) handleCancelEdit()
                  setEditingFarm(false)
                  setActiveTab(activeTab === "pessoal" ? null : "pessoal")
                }}
              >
                <span className="profile-setting-icon material-symbols-outlined" aria-hidden="true">person</span>
                <span><strong>{t("profile.personalInfo")}</strong><small>{t("profile.personalInfoDescription")}</small></span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {activeTab === "pessoal" ? "expand_more" : "chevron_right"}
                </span>
              </button>
              {activeTab === "pessoal" && (
                <section className="profile-expanded-content">
                  <PersonalInfoView
                    userData={userData}
                    user={user}
                    onEdit={canManageProfile ? openProfileEditor : undefined}
                    onChangePassword={handlePasswordReset}
                    passwordResetting={passwordResetting}
                  />
                </section>
              )}
            </div>

            <div className={`profile-setting-item ${activeTab === "fazenda" ? "is-open" : ""}`}>
              <button
                type="button"
                aria-expanded={activeTab === "fazenda"}
                onClick={() => {
                  if (editing) handleCancelEdit()
                  setEditingFarm(false)
                  setActiveTab(activeTab === "fazenda" ? null : "fazenda")
                }}
              >
                <span className="profile-setting-icon material-symbols-outlined" aria-hidden="true">agriculture</span>
                <span><strong>{t("profile.farm")}</strong><small>{t("profile.farmDescription")}</small></span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {activeTab === "fazenda" ? "expand_more" : "chevron_right"}
                </span>
              </button>
              {activeTab === "fazenda" && (
                <section className="profile-expanded-content">
                  {!editingFarm ? (
                    <FarmInfoView
                      farmData={farmData}
                      onAddFarm={canManageProfile ? handleAddFarm : undefined}
                      onEditFarm={canManageProfile ? handleEditFarm : undefined}
                      formatPhone={formatPhone}
                    />
                  ) : (
                    <FarmEditForm farmData={farmData} onSave={handleSaveFarm} onCancel={() => setEditingFarm(false)} saving={savingFarm} />
                  )}
                </section>
              )}
            </div>

            <div className={`profile-setting-item ${activeTab === "idioma" ? "is-open" : ""}`}>
              <button
                type="button"
                aria-expanded={activeTab === "idioma"}
                onClick={() => {
                  if (editing) handleCancelEdit()
                  setEditingFarm(false)
                  setActiveTab(activeTab === "idioma" ? null : "idioma")
                }}
              >
                <span className="profile-setting-icon material-symbols-outlined" aria-hidden="true">language</span>
                <span><strong>{t("profile.language")}</strong><small>{currentLanguageLabel}</small></span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {activeTab === "idioma" ? "expand_more" : "chevron_right"}
                </span>
              </button>
              {activeTab === "idioma" && (
                <section className="profile-expanded-content profile-language-settings">
                  <div className="profile-language-options" role="radiogroup" aria-label={t("profile.languageGroup")}>
                    {LANGUAGE_OPTIONS.map((option) => {
                      const isSelected = language === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={isSelected ? "is-selected" : ""}
                          disabled={languageSaving}
                          onClick={() => handleLanguageChange(option.value)}
                        >
                          <span className="profile-language-code">{option.shortLabel}</span>
                          <strong>{option.label}</strong>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {isSelected ? "check_circle" : "radio_button_unchecked"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {canManageProfile && <div className={`profile-setting-item ${editing ? "is-open" : ""}`}>
              <button
                type="button"
                aria-expanded={editing}
                onClick={() => {
                  if (editing) {
                    handleCancelEdit()
                  } else {
                    openProfileEditor()
                  }
                }}
              >
                <span className="profile-setting-icon material-symbols-outlined" aria-hidden="true">edit</span>
                <span><strong>{t("profile.edit")}</strong><small>{t("profile.editDescription")}</small></span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {editing ? "expand_more" : "chevron_right"}
                </span>
              </button>
              {editing && (
                <section className="profile-expanded-content profile-edit-target" ref={editSectionRef}>
                  <ProfileEditForm formData={formData} onChange={handleChange} onIconSelect={handleIconSelect} />
                  <div className="profile-edit-actions">
                    <button type="button" className="cancel" onClick={handleCancelEdit}>{t("common.cancel")}</button>
                    <button type="button" onClick={handleSave} disabled={saving}>
                      {saving ? t("common.saving") : t("profile.saveChanges")}
                    </button>
                  </div>
                </section>
              )}
            </div>}

            <div className="profile-setting-item">
              <button type="button" className="logout" onClick={handleLogout}>
                <span className="profile-setting-icon material-symbols-outlined" aria-hidden="true">logout</span>
                <span><strong>{t("profile.logout")}</strong><small>{t("profile.logoutDescription")}</small></span>
                <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <MenuBar />
    </>
  )
}
