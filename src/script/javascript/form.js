document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('form-container');
    const addButtons = document.querySelectorAll('.add-btn');

    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            const formItem = createFormItem(type);
            formContainer.appendChild(formItem);
        });
    });

    function createFormItem(type) {
        const div = document.createElement('div');
        div.className = 'form-field';
        
        switch(type) {
            case 'text':
                div.innerHTML = `
                    <label>
                        <span>テキスト項目</span>
                        <input type="text" name="fields[${Date.now()}][label]" placeholder="項目名" required>
                        <input type="hidden" name="fields[${Date.now()}][type]" value="text">
                    </label>
                    <button type="button" class="remove-btn">削除</button>
                `;
                break;
            case 'select':
                div.innerHTML = `
                    <label>
                        <span>選択項目</span>
                        <input type="text" name="fields[${Date.now()}][label]" placeholder="項目名" required>
                        <input type="hidden" name="fields[${Date.now()}][type]" value="select">
                        <div class="options-container">
                            <input type="text" name="fields[${Date.now()}][options][]" placeholder="選択肢1" required>
                            <input type="text" name="fields[${Date.now()}][options][]" placeholder="選択肢2" required>
                        </div>
                        <button type="button" class="add-option-btn">選択肢を追加</button>
                    </label>
                    <button type="button" class="remove-btn">削除</button>
                `;
                break;
            case 'checkbox':
                div.innerHTML = `
                    <label>
                        <span>チェックボックス項目</span>
                        <input type="text" name="fields[${Date.now()}][label]" placeholder="項目名" required>
                        <input type="hidden" name="fields[${Date.now()}][type]" value="checkbox">
                    </label>
                    <button type="button" class="remove-btn">削除</button>
                `;
                break;
        }

        // 削除ボタンのイベントリスナー
        div.querySelector('.remove-btn').addEventListener('click', function() {
            div.remove();
        });

        // 選択肢追加ボタンのイベントリスナー
        const addOptionBtn = div.querySelector('.add-option-btn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', function() {
                const optionsContainer = div.querySelector('.options-container');
                const newOption = document.createElement('input');
                newOption.type = 'text';
                newOption.name = `fields[${Date.now()}][options][]`;
                newOption.placeholder = '新しい選択肢';
                newOption.required = true;
                optionsContainer.appendChild(newOption);
            });
        }

        return div;
    }
}); 