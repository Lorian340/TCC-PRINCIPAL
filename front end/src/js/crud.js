document.addEventListener('DOMContentLoaded', () => {
    
    const API_URL = 'http://localhost:5501';

    const productList = document.getElementById('productList');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`);

            if (!response.ok) throw new Error('Falha ao carregar produtos.');
            
            const products = await response.json();
            
            renderProducts(products);

        } catch (error) {
            console.error('Erro ao buscar produtos:', error); 
            productList.innerHTML = `<p class="text-red-500 col-span-full">Erro ao carregar produtos. Verifique o console e se a API está rodando.</p>`;
            showToast('Erro ao carregar produtos.', 'error'); 
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const id = document.getElementById('productId').value; 
        const isEditing = !!id; 

        const formData = new FormData(productForm);

        formData.set('isNew', document.getElementById('isNew').checked);
        formData.set('isHot', document.getElementById('isHot').checked);
        formData.set('isLimited', document.getElementById('isLimited').checked);
        formData.set('isCollection', document.getElementById('isCollection').checked);

        if (isEditing && !formData.get('image').size) {
            formData.delete('image');
        }

        const url = isEditing ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            const response = await fetch(url, {
                method: method, 
                body: formData, 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ocorreu um erro no servidor.');
            }

            hideModal(); 
            fetchAndRenderProducts(); 
            showToast(`Produto ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            showToast(`Erro: ${error.message}`, 'error');
        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = isEditing ? 'Atualizar Produto' : 'Salvar Produto';
        }
    };

    const deleteProduct = async (id) => {

        if (!confirm('Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE', 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao deletar o produto.');
            }
            
            showToast('Produto deletado com sucesso!', 'success');
            fetchAndRenderProducts(); 
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            showToast(`Erro: ${error.message}`, 'error');
        }
    };

    const renderProducts = (products) => {
        productList.innerHTML = ''; 
        if (products.length === 0) {
            productList.innerHTML = `<p class="text-gray-500 col-span-full">Nenhum produto cadastrado ainda.</p>`;
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col';
            
            const badges = `
                ${product.isNew ? `<span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Novo</span>` : ''}
                ${product.isHot ? `<span class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Em Alta</span>` : ''}
                ${product.isLimited ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Limitado</span>` : ''}
                ${product.isCollection ? `<span class="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Coleção</span>` : ''}
            `;

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-gray-800">${product.name}</h3>
                    <p class="text-gray-600">${product.brand} - ${product.color}</p>
                    <p class="text-xl font-semibold text-blue-600 mt-1">R$ ${Number(product.price).toFixed(2).replace('.', ',')}</p>
                    <p class="text-sm text-gray-500 mt-1">Categoria: ${product.category}</p>
                    <div class="mt-3 flex flex-wrap gap-1">${badges}</div>
                    
                    <div class="flex justify-end space-x-2 mt-auto pt-4">
                        <button class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center transition cursor-pointer" data-id="${product.id}" title="Editar Produto">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center transition cursor-pointer" data-id="${product.id}" title="Deletar Produto">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

            productCard.dataset.product = JSON.stringify(product);
            productList.appendChild(productCard); 
        });
    };

    const showModal = (mode = 'add', product = null) => {
        productForm.reset(); 
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        
        if (mode === 'edit' && product) {
            modalTitle.textContent = 'Editar Produto';
            submitBtn.textContent = 'Atualizar Produto';
            document.getElementById('productId').value = product.id;
            document.getElementById('name').value = product.name;
            imagePreview.src = product.image;
            imagePreview.classList.remove('hidden');
        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
            submitBtn.textContent = 'Salvar Produto';
            document.getElementById('productId').value = '';
        }
        productModal.classList.remove('hidden'); 
        productModal.classList.add('flex');
    };

    const hideModal = () => {
        productModal.classList.add('hidden');
        productModal.classList.remove('flex');
    };

    const showToast = (message, type = 'success') => {
    };

    addProductBtn.addEventListener('click', () => showModal('add'));

    closeModalBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    productForm.addEventListener('submit', handleFormSubmit);

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    productList.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');

        if (editButton) {
    
            const productCard = editButton.closest('[data-product]');
            const productData = JSON.parse(productCard.dataset.product);
            showModal('edit', productData);
        }

        if (deleteButton) {
            const productId = deleteButton.dataset.id;
            deleteProduct(productId);
        }
    });

    fetchAndRenderProducts();
});