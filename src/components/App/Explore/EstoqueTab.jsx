import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "../../../styles/App/EstoqueTab.css"

const EMPTY_PRODUCT = {
  name: "",
  category: "insumo",
  quantity: "",
  unit: "unidade",
  minQuantity: "",
  price: "",
  supplier: "",
  expiryDate: ""
}

function validateNewProduct(product) {
  const errors = {}
  const quantity = Number(product.quantity)
  const minQuantity = Number(product.minQuantity)
  const price = Number(product.price)

  if (!product.name.trim()) errors.name = "Informe o nome do produto."
  if (!product.category) errors.category = "Selecione uma categoria."
  if (product.quantity === "") {
    errors.quantity = "Informe a quantidade."
  } else if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "A quantidade deve ser maior que zero."
  }
  if (!product.unit) errors.unit = "Selecione uma unidade."
  if (product.minQuantity === "") {
    errors.minQuantity = "Informe a quantidade mínima."
  } else if (!Number.isFinite(minQuantity) || minQuantity < 0) {
    errors.minQuantity = "A quantidade mínima não pode ser negativa."
  }
  if (product.price !== "" && (!Number.isFinite(price) || price <= 0)) {
    errors.price = "O preço deve ser maior que zero."
  }

  return errors
}

export default function EstoqueTab() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("todos")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [movements, setMovements] = useState([])
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT })
  const [newProductErrors, setNewProductErrors] = useState({})
  const newProductFormRef = useRef(null)

  // Categorias disponíveis
  const categories = [
    { id: "insumo", name: "Insumos", icon: "inventory" },
    { id: "fertilizante", name: "Fertilizantes", icon: "grass" },
    { id: "defensivo", name: "Defensivos", icon: "bug_report" },
    { id: "semente", name: "Sementes", icon: "psychiatry" },
    { id: "equipamento", name: "Equipamentos", icon: "handyman" }
  ]

  // Carregar estoque do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("inventory")
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      // Dados de exemplo
      const sampleProducts = [
        {
          id: 1,
          name: "Fungicida Premium",
          category: "defensivo",
          quantity: 150,
          unit: "litros",
          minQuantity: 50,
          price: 89.90,
          supplier: "AgroTech",
          expiryDate: "2025-12-31",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Fertilizante NPK 10-10-10",
          category: "fertilizante",
          quantity: 500,
          unit: "kg",
          minQuantity: 200,
          price: 45.50,
          supplier: "NutriAgro",
          expiryDate: "2026-06-30",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: "Semente de Soja",
          category: "semente",
          quantity: 1000,
          unit: "kg",
          minQuantity: 300,
          price: 120.00,
          supplier: "Sementes Brasil",
          expiryDate: "2025-08-15",
          createdAt: new Date().toISOString()
        }
      ]
      setProducts(sampleProducts)
      localStorage.setItem("inventory", JSON.stringify(sampleProducts))
    }
  }, [])

  useEffect(() => {
    const savedMovements = localStorage.getItem("inventoryMovements")
    if (savedMovements) {
      try {
        const parsedMovements = JSON.parse(savedMovements)
        setMovements(Array.isArray(parsedMovements) ? parsedMovements : [])
      } catch {
        setMovements([])
      }
    }
  }, [])

  useEffect(() => {
    const menuBars = document.querySelectorAll(".nav, .menu-bar")

    menuBars.forEach((menuBar) => {
      menuBar.style.display = showForm || selectedProduct ? "none" : ""
    })

    return () => {
      menuBars.forEach((menuBar) => {
        menuBar.style.display = ""
      })
    }
  }, [showForm, selectedProduct])

  // Salvar produtos
  const saveProducts = (newProducts) => {
    setProducts(newProducts)
    localStorage.setItem("inventory", JSON.stringify(newProducts))
  }

  const recordMovement = (productId, type, amount = 0) => {
    const nextMovements = [
      { id: Date.now(), productId, type, amount, createdAt: new Date().toISOString() },
      ...movements,
    ].slice(0, 300)

    setMovements(nextMovements)
    localStorage.setItem("inventoryMovements", JSON.stringify(nextMovements))
  }

  // Adicionar produto
  const updateNewProductField = (field, value) => {
    setNewProduct(current => ({ ...current, [field]: value }))
    setNewProductErrors(current => {
      if (!current[field]) return current
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const closeNewProductForm = () => {
    setShowForm(false)
    setNewProductErrors({})
  }

  const addProduct = () => {
    const validationErrors = validateNewProduct(newProduct)

    if (Object.keys(validationErrors).length > 0) {
      setNewProductErrors(validationErrors)
      requestAnimationFrame(() => {
        newProductFormRef.current?.querySelector('[aria-invalid="true"]')?.focus()
      })
      return
    }

    const product = {
      id: Date.now(),
      ...newProduct,
      name: newProduct.name.trim(),
      supplier: newProduct.supplier.trim(),
      quantity: Number(newProduct.quantity),
      minQuantity: Number(newProduct.minQuantity),
      price: newProduct.price === "" ? 0 : Number(newProduct.price),
      createdAt: new Date().toISOString()
    }

    saveProducts([...products, product])
    recordMovement(product.id, "entrada", product.quantity)
    setNewProduct({ ...EMPTY_PRODUCT })
    setNewProductErrors({})
    setShowForm(false)
  }

  // Atualizar produto
  const updateProduct = () => {
    if (!selectedProduct) return

    const previousProduct = products.find(product => product.id === selectedProduct.id)

    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? { ...selectedProduct } : p
    )
    saveProducts(updatedProducts)
    recordMovement(
      selectedProduct.id,
      "ajuste",
      selectedProduct.quantity - (previousProduct?.quantity || 0)
    )
    setSelectedProduct(null)
  }

  // Deletar produto
  const deleteProduct = (id) => {
    if (!window.confirm("Tem certeza que deseja remover este produto?")) return false

    const product = products.find(item => item.id === id)
    saveProducts(products.filter(p => p.id !== id))
    recordMovement(id, "exclusão", -(product?.quantity || 0))
    return true
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR")
    const searchableText = [
      product.name,
      categories.find(category => category.id === product.category)?.name,
      product.supplier,
    ].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR")
    const matchesSearch = searchableText.includes(normalizedSearch)
    const matchesCategory = filterCategory === "todos" || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Estatísticas
  const totalProducts = products.length
  const lowStock = products.filter(p => p.quantity <= p.minQuantity).length
  const recentMovements = movements.filter(movement => (
    new Date(movement.createdAt).getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000)
  )).length

  // Obter ícone da categoria
  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category)
    return cat?.icon || "inventory"
  }

  // Obter nome da categoria
  const getCategoryName = (category) => {
    const cat = categories.find(c => c.id === category)
    return cat?.name || category
  }

  // Verificar se está em falta
  const isLowStock = (product) => {
    return product.quantity <= product.minQuantity
  }

  const getStockStatus = (product) => {
    if (product.quantity <= 0) return { label: "Crítico", tone: "critical" }
    if (isLowStock(product)) return { label: "Baixo estoque", tone: "warning" }
    return { label: "Disponível", tone: "available" }
  }

  return (
    <div className="estoque-container estoque-dashboard">
      <section className="estoque-hero" aria-labelledby="estoque-title">
        <div className="estoque-hero-copy">
          <h1 id="estoque-title">Estoque</h1>
          <p>Gerencie insumos, produtos e materiais da fazenda</p>
        </div>
      </section>

      <section className="estoque-stats" aria-label="Resumo do estoque">
        <div className="stat-card">
          <span className="material-symbols-outlined" aria-hidden="true">deployed_code</span>
          <strong>{totalProducts}</strong>
          <p>Itens em estoque</p>
        </div>
        <div className="stat-card warning">
          <span className="material-symbols-outlined" aria-hidden="true">warning</span>
          <strong>{lowStock}</strong>
          <p>Baixo estoque</p>
        </div>
        <div className="stat-card movements">
          <span className="material-symbols-outlined" aria-hidden="true">sync</span>
          <strong>{recentMovements}</strong>
          <p>Movimentações</p>
          <small>Últimos 7 dias</small>
        </div>
      </section>

      <section className="estoque-content">
        <div className="estoque-controls">
          <label className="search-bar">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              type="search"
              aria-label="Buscar produto"
              placeholder="Buscar produto ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={`filter-toggle ${filtersOpen ? "active" : ""}`}
            aria-label="Filtrar produtos"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(value => !value)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
          </button>
          <button
            type="button"
            className="add-product-btn"
            aria-label="Adicionar produto"
            onClick={() => setShowForm(true)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              className="category-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button
                className={`filter-chip ${filterCategory === "todos" ? "active" : ""}`}
                onClick={() => setFilterCategory("todos")}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${filterCategory === cat.id ? "active" : ""}`}
                  onClick={() => setFilterCategory(cat.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="products-list">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">inventory</span>
            <p>Nenhum produto encontrado</p>
            <button onClick={() => setShowForm(true)}>Adicionar produto</button>
          </div>
        ) : (
          filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product)

            return (
            <motion.div
              key={product.id}
              className={`product-card ${isLowStock(product) ? "low-stock" : ""}`}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.2) }}
              onClick={() => setSelectedProduct(product)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelectedProduct(product)
                }
              }}
            >
              <div className={`product-icon product-icon--${product.category}`}>
                <span className="material-symbols-outlined" aria-hidden="true">{getCategoryIcon(product.category)}</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="product-category">{getCategoryName(product.category)}</span>
                <div className="product-quantity">
                  <strong>{product.quantity.toLocaleString("pt-BR")}</strong>
                  <span>{product.unit}</span>
                </div>
              </div>
              <div className="product-row-end">
                <span className={`stock-status stock-status--${stockStatus.tone}`}>
                  {stockStatus.label}
                </span>
                <span className="material-symbols-outlined product-chevron" aria-hidden="true">chevron_right</span>
              </div>
            </motion.div>
            )
          })
        )}
        </div>
      </section>

      {/* Modal Novo Produto */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="estoque-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNewProductForm}
          >
            <motion.form
              ref={newProductFormRef}
              className="product-form"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault()
                addProduct()
              }}
              noValidate
            >
              <div className="form-header">
                <h3>Novo Produto</h3>
                <button type="button" className="close-btn" aria-label="Fechar cadastro" onClick={closeNewProductForm}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="new-product-name">
                  Nome do produto <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <input
                  id="new-product-name"
                  type="text"
                  placeholder="Ex: Fungicida Premium"
                  value={newProduct.name}
                  onChange={(e) => updateNewProductField("name", e.target.value)}
                  required
                  aria-invalid={Boolean(newProductErrors.name)}
                  aria-describedby={newProductErrors.name ? "new-product-name-error" : undefined}
                />
                {newProductErrors.name && <span id="new-product-name-error" className="product-form-error">{newProductErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="new-product-category">
                  Categoria <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <select
                  id="new-product-category"
                  value={newProduct.category}
                  onChange={(e) => updateNewProductField("category", e.target.value)}
                  required
                  aria-invalid={Boolean(newProductErrors.category)}
                  aria-describedby={newProductErrors.category ? "new-product-category-error" : undefined}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {newProductErrors.category && <span id="new-product-category-error" className="product-form-error">{newProductErrors.category}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-product-quantity">
                    Quantidade <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="new-product-quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0"
                    value={newProduct.quantity}
                    onChange={(e) => updateNewProductField("quantity", e.target.value)}
                    required
                    aria-invalid={Boolean(newProductErrors.quantity)}
                    aria-describedby={newProductErrors.quantity ? "new-product-quantity-error" : undefined}
                  />
                  {newProductErrors.quantity && <span id="new-product-quantity-error" className="product-form-error">{newProductErrors.quantity}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="new-product-unit">
                    Unidade <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="new-product-unit"
                    value={newProduct.unit}
                    onChange={(e) => updateNewProductField("unit", e.target.value)}
                    required
                    aria-invalid={Boolean(newProductErrors.unit)}
                    aria-describedby={newProductErrors.unit ? "new-product-unit-error" : undefined}
                  >
                    <option value="unidade">Unidade</option>
                    <option value="kg">Kg</option>
                    <option value="litros">Litros</option>
                    <option value="sacos">Sacos</option>
                    <option value="caixas">Caixas</option>
                  </select>
                  {newProductErrors.unit && <span id="new-product-unit-error" className="product-form-error">{newProductErrors.unit}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-product-min-quantity">
                    Quantidade mínima <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="new-product-min-quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.minQuantity}
                    onChange={(e) => updateNewProductField("minQuantity", e.target.value)}
                    required
                    aria-invalid={Boolean(newProductErrors.minQuantity)}
                    aria-describedby={newProductErrors.minQuantity ? "new-product-min-quantity-error" : undefined}
                  />
                  {newProductErrors.minQuantity && <span id="new-product-min-quantity-error" className="product-form-error">{newProductErrors.minQuantity}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="new-product-price">Preço unitário (R$) <small>Opcional</small></label>
                  <input
                    id="new-product-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={newProduct.price}
                    onChange={(e) => updateNewProductField("price", e.target.value)}
                    aria-invalid={Boolean(newProductErrors.price)}
                    aria-describedby={newProductErrors.price ? "new-product-price-error" : undefined}
                  />
                  {newProductErrors.price && <span id="new-product-price-error" className="product-form-error">{newProductErrors.price}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-product-supplier">Fornecedor <small>Opcional</small></label>
                <input
                  id="new-product-supplier"
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={newProduct.supplier}
                  onChange={(e) => updateNewProductField("supplier", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-product-expiry">Data de validade <small>Opcional</small></label>
                <input
                  id="new-product-expiry"
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => updateNewProductField("expiryDate", e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn">
                Adicionar produto
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Produto */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="estoque-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="product-form"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-header">
                <h3>Editar Produto</h3>
                <button className="close-btn" onClick={() => setSelectedProduct(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="form-group">
                <label>Nome do produto</label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={selectedProduct.category}
                  onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedProduct.quantity}
                    onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select
                    value={selectedProduct.unit}
                    onChange={(e) => setSelectedProduct({...selectedProduct, unit: e.target.value})}
                  >
                    <option value="unidade">Unidade</option>
                    <option value="kg">Kg</option>
                    <option value="litros">Litros</option>
                    <option value="sacos">Sacos</option>
                    <option value="caixas">Caixas</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade mínima</label>
                  <input
                    type="number"
                    value={selectedProduct.minQuantity}
                    onChange={(e) => setSelectedProduct({...selectedProduct, minQuantity: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Preço unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fornecedor</label>
                <input
                  type="text"
                  value={selectedProduct.supplier || ""}
                  onChange={(e) => setSelectedProduct({...selectedProduct, supplier: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Data de validade</label>
                <input
                  type="date"
                  value={selectedProduct.expiryDate || ""}
                  onChange={(e) => setSelectedProduct({...selectedProduct, expiryDate: e.target.value})}
                />
              </div>

              <button className="submit-btn" onClick={updateProduct}>
                Salvar alterações
              </button>
              <button
                className="delete-form-btn"
                onClick={() => {
                  if (deleteProduct(selectedProduct.id)) setSelectedProduct(null)
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                Excluir produto
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
